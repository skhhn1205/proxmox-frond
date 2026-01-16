create table if not exists vms (
  id integer primary key autoincrement,
  name text not null,
  status text not null,
  proxmox_id text,
  created_at text not null
);
