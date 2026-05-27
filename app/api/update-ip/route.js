import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST(request) {
  try {
    const { licenseKey, serverIp } = await request.json();

    if (!licenseKey) {
      return NextResponse.json({ message: "Chave em falta." }, { status: 400 });
    }

    // Atualiza o IP direto no Supabase onde a chave for igual
    const { error } = await supabase
      .from('licenses')
      .update({ server_ip: serverIp })
      .eq('license_key', licenseKey);

    if (error) throw error;

    return NextResponse.json({ message: "Sucesso!" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}