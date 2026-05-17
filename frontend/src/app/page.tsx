import { redirect } from 'next/navigation';

export default function Home() {
  // Kullanıcı sisteme girer girmez doğrudan Dashboard karşılama paneline aktarılır
  redirect('/dashboard'); 
}
