'use client';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se o gajo já estiver logado, manda direto para o painel
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
      setLoading(false);
    });
  }, [router]);

  const loginComDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>A carregar...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>PERALTA STUDIOS</h1>
      <p style={{ color: '#8a99ad', marginBottom: '30px' }}>Gere as tuas licenças de MTA de forma segura</p>
      
      <button 
        onClick={loginComDiscord}
        style={{ padding: '15px 30px', backgroundColor: '#5865F2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(88, 101, 242, 0.4)' }}
      >
        Entrar com o Discord
      </button>
    </div>
  );
}