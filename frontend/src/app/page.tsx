import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the customer app by default
  redirect('/customer');
}
