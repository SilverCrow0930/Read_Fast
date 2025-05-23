create table public.referrals (id uuid default uuid_generate_v4() primary key, referrer_id uuid references auth.users(id) on delete cascade, referred_id uuid references auth.users(id) on delete cascade, created_at timestamp with time zone default timezone('utc'::text, now()) not null, count integer default 0, unique(referrer_id, referred_id)); alter table public.referrals enable row level security; create policy \
Users
can
view
their
own
referral
data\ on public.referrals for select using (auth.uid() = referrer_id); create policy \System
can
insert
referral
data\ on public.referrals for insert with check (true); create policy \System
can
update
referral
counts\ on public.referrals for update using (true) with check (true);
