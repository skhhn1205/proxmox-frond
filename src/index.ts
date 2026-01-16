import { Hono } from 'hono';

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  APP_ENV: string;
}

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => {
  return c.json({ status: 'ok', env: c.env.APP_ENV });
});

app.get('/vms', async (c) => {
  const { results } = await c.env.DB.prepare(
    'select id, name, status, proxmox_id, created_at from vms order by id desc'
  ).all();

  return c.json({ vms: results });
});

app.post('/vms', async (c) => {
  const payload = await c.req.json<{ name?: string }>();

  if (!payload.name) {
    return c.json({ error: 'name is required' }, 400);
  }

  const createdAt = new Date().toISOString();

  const result = await c.env.DB.prepare(
    'insert into vms (name, status, created_at) values (?, ?, ?)'
  )
    .bind(payload.name, 'provisioning', createdAt)
    .run();

  return c.json({ id: result.meta.last_row_id, status: 'provisioning' }, 201);
});

app.get('/vms/:id', async (c) => {
  const id = Number(c.req.param('id'));

  if (Number.isNaN(id)) {
    return c.json({ error: 'invalid id' }, 400);
  }

  const { results } = await c.env.DB.prepare(
    'select id, name, status, proxmox_id, created_at from vms where id = ?'
  )
    .bind(id)
    .all();

  const [vm] = results;

  if (!vm) {
    return c.json({ error: 'not found' }, 404);
  }

  return c.json({ vm });
});

app.delete('/vms/:id', async (c) => {
  const id = Number(c.req.param('id'));

  if (Number.isNaN(id)) {
    return c.json({ error: 'invalid id' }, 400);
  }

  const result = await c.env.DB.prepare(
    'update vms set status = ? where id = ?'
  )
    .bind('deleting', id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'not found' }, 404);
  }

  return c.json({ id, status: 'deleting' });
});

app.put('/vms/:id/reset', async (c) => {
  const id = Number(c.req.param('id'));

  if (Number.isNaN(id)) {
    return c.json({ error: 'invalid id' }, 400);
  }

  const result = await c.env.DB.prepare(
    'update vms set status = ? where id = ?'
  )
    .bind('resetting', id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'not found' }, 404);
  }

  return c.json({ id, status: 'resetting' });
});

export default app;
