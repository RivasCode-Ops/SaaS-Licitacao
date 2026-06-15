import { useState } from 'react';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const colabUrl = "https://colab.research.google.com/github/SEU_USUARIO/SEU_REPO/blob/main/tutorial-colab.ipynb";
  const repoUrl = "https://github.com/SEU_USUARIO/SEU_REPO";

  const codigoColab = `!pip install open-mythos -q

from open_mythos import MythosConfig, OpenMythos

cfg = MythosConfig(
    vocab_size=1000,
    dim=128,
    n_heads=4,
    n_kv_heads=2,
    max_seq_len=64,
    max_loop_iters=3,
    prelude_layers=1,
    coda_layers=1,
    attn_type="gqa",
    n_experts=4,
    n_shared_experts=1,
    n_experts_per_tok=2,
    expert_dim=64,
    lora_rank=4,
)
model = OpenMythos(cfg)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codigoColab);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    { q: "Preciso instalar algo no meu computador?", a: "Não! O Google Colab roda tudo no navegador, com GPU grátis. Nenhuma instalação local necessária." },
    { q: "Quanto tempo leva para treinar?", a: "Com a configuração reduzida (dim=128, prelude=1, coda=1), 1 época leva cerca de 1-3 minutos no Colab com GPU T4." },
    { q: "Posso salvar meu modelo treinado?", a: "Sim! Use torch.save(model.state_dict(), 'meu_modelo.pt') e depois baixe do Colab." },
    { q: "O que é RDT (Recurrent-Depth Transformer)?", a: "É a arquitetura do OpenMythos: Prelúdio → loop recorrente (o modelo 'pensa' várias vezes) → Coda. O parâmetro max_loop_iters controla quantas vezes cada token é processado." },
    { q: "Diferença entre MLA e GQA?", a: "MLA (Multi-Latent Attention) comprime chaves/valores num latente (kv_lora_rank), economizando memória do cache. GQA (Grouped Query Attention) usa menos KV heads que Q heads. Você comuta via cfg.attn_type." },
    { q: "O OpenMythos já vem treinado?", a: "Não. É apenas a arquitetura — você treina do zero. O tutorial ensina o fluxo completo com dataset próprio." },
  ];

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🇧🇷 OpenMythos para Iniciantes</h1>
        <p style={styles.subtitle}>RDT (Recurrent-Depth Transformer) — Aprenda sem instalar nada!</p>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>🚀 Google Colab</div>
          <div style={styles.cardBody}>
            <p style={styles.cardText}>
              Rode o modelo diretamente no seu navegador, com GPU grátis.{" "}
              <strong>Nenhuma instalação necessária!</strong>
            </p>
            <a href={colabUrl} target="_blank" rel="noopener noreferrer" style={styles.button}>
              📓 Abrir no Google Colab
            </a>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>🎥 Vídeo Tutorial</div>
          <div style={styles.cardBody}>
            <p>Assista ao passo a passo completo:</p>
            <div style={styles.videoPlaceholder}>
              📺 Em breve: tutorial em vídeo no YouTube
            </div>
            <p style={styles.note}>🔜 Inscreva-se no canal para ser avisado quando sair!</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>🧠 O que é OpenMythos?</div>
          <div style={styles.cardBody}>
            <p>Reconstrução open-source da arquitetura <strong>Claude Mythos</strong> (13.8k stars, MIT).</p>
            <div style={styles.featureList}>
              <div style={styles.feature}>🔁 <strong>RDT</strong> — Prelúdio → loop recorrente → Coda</div>
              <div style={styles.feature}>🎯 <strong>Attention comutável</strong> — MLA / GQA</div>
              <div style={styles.feature}>🧩 <strong>MoE esparso</strong> — Mixture of Experts</div>
              <div style={styles.feature}>⚡ <strong>LTI-estável</strong> — Raio espectral &lt; 1 garantido</div>
              <div style={styles.feature}>⏱️ <strong>ACT halting</strong> — Parada adaptativa por token</div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>💻 Código mínimo</div>
          <div style={styles.cardBody}>
            <pre style={styles.codeBlock}>
              <code>{codigoColab}</code>
            </pre>
            <button onClick={handleCopy} style={styles.copyButton}>
              {copied ? "✅ Copiado!" : "📋 Copiar código"}
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>📊 Configurações disponíveis</div>
          <div style={styles.cardBody}>
            <table style={styles.table}>
              <thead>
                <tr><th style={styles.th}>Variante</th><th style={styles.th}>Params</th><th style={styles.th}>dim</th><th style={styles.th}>Loops</th><th style={styles.th}>Contexto</th></tr>
              </thead>
              <tbody>
                <tr><td style={styles.td}>mythos_1b()</td><td style={styles.td}>1B</td><td style={styles.td}>2048</td><td style={styles.td}>16</td><td style={styles.td}>4K</td></tr>
                <tr><td style={styles.td}>mythos_3b()</td><td style={styles.td}>3B</td><td style={styles.td}>3072</td><td style={styles.td}>16</td><td style={styles.td}>4K</td></tr>
                <tr><td style={styles.td}>mythos_10b()</td><td style={styles.td}>10B</td><td style={styles.td}>4096</td><td style={styles.td}>24</td><td style={styles.td}>8K</td></tr>
                <tr><td style={styles.td}>mythos_50b()</td><td style={styles.td}>50B</td><td style={styles.td}>6144</td><td style={styles.td}>32</td><td style={styles.td}>8K</td></tr>
                <tr><td style={styles.td}>mythos_100b()</td><td style={styles.td}>100B</td><td style={styles.td}>8192</td><td style={styles.td}>32</td><td style={styles.td}>1M</td></tr>
                <tr><td style={styles.td}>mythos_1t()</td><td style={styles.td}>1T</td><td style={styles.td}>16384</td><td style={styles.td}>64</td><td style={styles.td}>1M</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>❓ Perguntas Frequentes (FAQ)</div>
          <div style={styles.cardBody}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={styles.faqItem}>
                <button onClick={() => toggleFaq(idx)} style={styles.faqQuestion}>
                  <span>{faqOpen === idx ? "▼" : "▶"}</span> {faq.q}
                </button>
                {faqOpen === idx && (
                  <div style={styles.faqAnswer}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>💡 Dicas para iniciantes</div>
          <div style={styles.cardBody}>
            <ul style={styles.list}>
              <li>Crie um <code>MythosConfig</code> pequeno (<code>dim=128</code>) para treinar rápido</li>
              <li><code>max_loop_iters</code> controla quantas vezes o modelo "pensa"</li>
              <li>No Colab: Runtime → Change runtime type → T4 GPU (grátis!)</li>
              <li>Dataset pequeno (100 frases) é suficiente para entender o fluxo</li>
              <li>Loss diminuindo = modelo está aprendendo</li>
              <li><strong>Não esqueça:</strong> sem checkpoint pré-treinado — você treina do zero!</li>
            </ul>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>OpenMythos — MIT License | Tutorial para iniciantes 🇧🇷</p>
        <p>
          📚 <a href={colabUrl} target="_blank" style={styles.link}>Abra o Colab</a> •{" "}
          🐙 <a href={repoUrl} style={styles.link}>GitHub</a> •{" "}
          ⭐ Deixe uma estrela!
        </p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    padding: '3rem 1rem',
    borderBottom: '1px solid #2a2a2a',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#888',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #2a2a2a',
    overflow: 'hidden',
  },
  cardHeader: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    padding: '1rem 1.5rem',
    backgroundColor: '#222',
    borderBottom: '1px solid #333',
  },
  cardBody: {
    padding: '1.5rem',
  },
  cardText: {
    lineHeight: 1.6,
    marginBottom: '1rem',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#667eea',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '0.5rem',
  },
  note: {
    fontSize: '0.85rem',
    color: '#888',
    marginTop: '0.5rem',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginTop: '1rem',
  },
  feature: {
    padding: '0.5rem',
    backgroundColor: '#222',
    borderRadius: '6px',
  },
  codeBlock: {
    backgroundColor: '#0d0d0d',
    padding: '1rem',
    borderRadius: '8px',
    overflowX: 'auto' as const,
    fontSize: '0.85rem',
    border: '1px solid #333',
    marginBottom: '1rem',
  },
  copyButton: {
    backgroundColor: '#333',
    color: '#e0e0e0',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.5rem',
    borderBottom: '1px solid #333',
    color: '#888',
    fontWeight: 'normal',
    fontSize: '0.85rem',
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #222',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
  },
  list: {
    margin: 0,
    paddingLeft: '1.5rem',
    lineHeight: 1.8,
  },
  faqItem: {
    marginBottom: '0.75rem',
    borderBottom: '1px solid #2a2a2a',
    paddingBottom: '0.5rem',
  },
  faqQuestion: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '1rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    padding: '0.5rem 0',
    fontWeight: 'bold',
  },
  faqAnswer: {
    padding: '0.5rem 0 1rem 1.5rem',
    color: '#aaa',
    lineHeight: 1.5,
  },
  videoPlaceholder: {
    backgroundColor: '#222',
    padding: '2rem',
    textAlign: 'center' as const,
    borderRadius: '8px',
    margin: '1rem 0',
    color: '#666',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '2rem',
    borderTop: '1px solid #2a2a2a',
    color: '#666',
    fontSize: '0.9rem',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
  },
};
