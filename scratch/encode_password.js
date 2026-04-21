const password = process.argv[2];
if (!password) {
  console.log('Usage: node scratch/encode_password.js YOUR_PASSWORD');
  process.exit(1);
}
const encoded = encodeURIComponent(password);
const url = `postgresql://postgres.zgmhkvpctiineanjmvga:${encoded}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;
console.log('\n✅ Encoded password:', encoded);
console.log('\n✅ Full DATABASE_URL to paste into Vercel:');
console.log(url);
