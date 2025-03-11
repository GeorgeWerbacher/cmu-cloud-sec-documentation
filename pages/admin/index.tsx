import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to usage page
    router.replace('/admin/usage');
  }, [router]);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting to Admin Dashboard...</h1>
      <p>Please wait while we redirect you to the admin dashboard.</p>
    </div>
  );
} 