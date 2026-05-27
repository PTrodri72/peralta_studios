'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ips, setIps] = useState({});

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);
      
      // Procurar as licenças do utilizador no Supabase
      const { data } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', session.user.id);
      
      setLicenses(data || []);
      
      // Popular o estado dos inputs de IP com o que já está na BD
      const initialIps = {};
      data?.forEach(lic => { initialIps[lic.id] = lic.server_ip || ''; });
      setIps(initialIps);
      
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleIpChange = (id, val) => {
    setIps(prev => ({ ...prev, [id]: val }));
  };

  const salvarIp = async (licenseId, licenseKey) => {
    const novoIp = ips[licenseId];

    const res = await fetch('/api/update-ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, serverIp: novoIp }),
    });

    const resultado = await res.json();
    if (res.ok) {
      alert("IP atualizado com sucesso no Supabase!");
    } else {
      alert("Erro: " + resultado.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div style={{ padding: '20px' }}>A autenticar...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #232936', paddingBottom: '20px' }}>
        <div>
          <h2>Olá, {user.user_metadata.full_name || user.email} 👋</h2>
          <p style={{ color: '#8a99ad', margin: 0 }}>ID Discord: {user.user_metadata.provider_id}</p>
        </div>
        <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#e03e3e', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
      </div>

      <h3>As Tuas Licenças</h3>
      {licenses.length === 0 ? (
        <p style={{ color: '#8a99ad' }}>Não tens nenhuma licença ativa nesta conta do Discord.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {licenses.map((lic) => (
            <div key={lic.id} style={{ backgroundColor: '#161b26', padding: '20px', borderRadius: '10px', border: '1px solid #232936', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#5865F2' }}>{lic.resource_name.toUpperCase()}</h4>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Chave: <code style={{ backgroundColor: '#0e1118', padding: '3px 6px', borderRadius: '4px' }}>{lic.license_key}</code></p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: lic.status === 'active' ? '#2ecc71' : '#e74c3c' }}>Estado: {lic.status === 'active' ? 'Ativo' : 'Suspenso'}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#8a99ad', marginBottom: '5px' }}>IP do Servidor MTA:</label>
                  <input 
                    type="text" 
                    value={ips[lic.id] || ''} 
                    onChange={(e) => handleIpChange(lic.id, e.target.value)}
                    placeholder="Ex: 154.21.32.10"
                    style={{ backgroundColor: '#0e1118', border: '1px solid #232936', color: '#fff', padding: '10px', borderRadius: '5px', width: '200px' }}
                  />
                </div>
                <button 
                  onClick={() => salvarIp(lic.id, lic.license_key)}
                  style={{ backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Salvar IP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}