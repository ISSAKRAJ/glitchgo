import { supabase } from './src/lib/supabase';

async function run() {
  console.log('--- Fetching Client Requests Count from Supabase ---');
  
  const { data, count, error } = await supabase
    .from('client_requests')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching count from Supabase:', error);
    process.exit(1);
  }

  console.log('Total client requests count:', count);
  
  // Retrieve the list of recent requests to print names
  const { data: requests, error: err2 } = await supabase
    .from('client_requests')
    .select('id, name, contact, status, deadline, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (err2) {
    console.error('Error fetching requests list:', err2);
    process.exit(1);
  }
  
  console.log('\n--- Recent Client Requests ---');
  if (!requests || requests.length === 0) {
    console.log('No client requests found in the database.');
  } else {
    requests.forEach((req, idx) => {
      console.log(`${idx + 1}. [${req.status || 'Received'}] ${req.name} (${req.contact}) - ${req.deadline} - ${req.created_at}`);
    });
  }
  
  console.log('--------------------------------------------');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
