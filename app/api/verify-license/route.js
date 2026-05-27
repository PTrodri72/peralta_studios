import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { license_key, resource_name } = await request.json();
    
    // Captura o IP real da máquina que efetuou o pedido (o host do MTA)
    const clientIp = request.headers.get('x-forwarded-for') || request.ip;

    if (!license_key || !resource_name) {
      return NextResponse.json({ authenticated: false, message: "Argumentos inválidos." }, { status: 400 });
    }

    // Consulta em tempo real no Supabase
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', license_key)
      .eq('resource_name', resource_name)
      .single();

    if (error || !license) {
      return NextResponse.json({ authenticated: false, message: "Licença não registada na Peralta Studios." }, { status: 401 });
    }

    if (license.status !== 'active') {
      return NextResponse.json({ authenticated: false, message: "Esta licença foi suspensa pelo Administrador." }, { status: 403 });
    }

    if (!license.server_ip) {
      return NextResponse.json({ authenticated: false, message: "Falta configurar o vosso IP no painel do site." }, { status: 403 });
    }

    // 🔥 Bloqueia se o IP for diferente do que está configurado no Supabase
    if (license.server_ip !== clientIp) {
      return NextResponse.json({ 
        authenticated: false, 
        message: `IP Proibido. Servidor corre em: ${clientIp}. Painel configurado para: ${license.server_ip}` 
      }, { status: 401 });
    }

    // Sucesso absoluto
    return NextResponse.json({ authenticated: true, message: "Acesso Autorizado!" });

  } catch (err) {
    return NextResponse.json({ authenticated: false, message: "Falha de comunicação com a BD." }, { status: 500 });
  }
}