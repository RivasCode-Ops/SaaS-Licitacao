# 🇧🇷 OpenMythos para Iniciantes

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/SEU_USUARIO/SEU_REPO/blob/main/tutorial-colab.ipynb)
[![Vercel](https://img.shields.io/badge/vercel-deployed-black)](https://openmythos-tutorial.vercel.app)
[![MIT License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![OpenMythos](https://img.shields.io/badge/OpenMythos-13.8k⭐-blue)](https://github.com/kyegomez/OpenMythos)
[![PyTorch](https://img.shields.io/badge/PyTorch-Implemented-EE4C2C?logo=pytorch)](https://pytorch.org)
[![Validate Tutorial](https://github.com/SEU_USUARIO/openmythos-tutorial/actions/workflows/validate.yml/badge.svg)](https://github.com/SEU_USUARIO/openmythos-tutorial/actions/workflows/validate.yml)

---

## 📖 Sobre

Tutorial **100% em português** para iniciantes sobre o [OpenMythos](https://github.com/kyegomez/OpenMythos) — reconstrução open-source da arquitetura **Claude Mythos** (RDT - Recurrent-Depth Transformer).

**Você vai aprender:**
- 🚀 Carregar a arquitetura OpenMythos
- 📝 Criar um dataset minúsculo (100 frases em português)
- 🎯 Treinar por 1 época no Google Colab (GPU grátis)
- 💬 Gerar texto com o modelo treinado

**Nenhuma instalação local necessária!** Tudo roda no seu navegador.

---

## 🚀 Comece agora

### Opção 1: Google Colab (recomendado)

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/SEU_USUARIO/SEU_REPO/blob/main/tutorial-colab.ipynb)

Clique no botão acima e siga o notebook passo a passo.

### Opção 2: Site interativo

Acesse: **[https://openmythos-tutorial.vercel.app](https://openmythos-tutorial.vercel.app)**

### Opção 3: Rodar localmente

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO/website
npm install
npm run dev
```

---

## 📁 Estrutura

```
openmythos-vercel/
├── tutorial-colab.ipynb          # Notebook para Google Colab
├── README.md                     # Este arquivo
├── .gitignore
└── website/                      # Site Next.js para Vercel
    ├── pages/index.tsx           # Página principal com FAQ
    ├── styles/globals.css        # Estilos globais
    ├── package.json              # Dependências
    └── next.config.js            # Configuração Next.js
```

---

## 🧠 O que é OpenMythos?

| Componente | Descrição | Parâmetro |
|------------|-----------|-----------|
| **RDT** | Prelúdio → loop recorrente → Coda | `max_loop_iters` |
| **Attention** | MLA (cache comprimido) ou GQA (menos KV heads) | `attn_type` |
| **MoE esparso** | N experts, top-K ativos por token | `n_experts`, `n_experts_per_tok` |
| **LTI-estável** | Raio espectral < 1 por construção (Parcae) | — (automático) |
| **ACT halting** | Parada adaptativa por token | `act_threshold` |
| **LoRA depth** | Adaptação por profundidade de loop | `lora_rank` |

### Configurações pré-definidas

| Variante | Parâmetros | dim | Experts | Loops | Contexto |
|----------|-----------|-----|---------|-------|----------|
| `mythos_1b()` | 1B | 2048 | 64 | 16 | 4K |
| `mythos_3b()` | 3B | 3072 | 64 | 16 | 4K |
| `mythos_10b()` | 10B | 4096 | 128 | 24 | 8K |
| `mythos_50b()` | 50B | 6144 | 256 | 32 | 8K |
| `mythos_100b()` | 100B | 8192 | 256 | 32 | 1M |
| `mythos_1t()` | 1T | 16384 | 512 | 64 | 1M |

---

## 💻 Código mínimo

```python
!pip install open-mythos -q

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
model = OpenMythos(cfg)
```

---

## ❓ FAQ

**Preciso instalar algo?**
Não! O Google Colab roda tudo no navegador.

**Quanto tempo leva?**
Com dim=128 e 1 época, leva 1-3 minutos no Colab com GPU T4.

**Posso salvar meu modelo?**
Sim: `torch.save(model.state_dict(), 'meu_modelo.pt')`

**O OpenMythos já vem treinado?**
Não. É apenas a arquitetura — você treina do zero.

**Diferença entre MLA e GQA?**
MLA comprime K/V num latente (`kv_lora_rank`), economizando cache. GQA usa menos KV heads que Q heads. Configure com `attn_type`.

---

## 📚 Recursos

- [OpenMythos original](https://github.com/kyegomez/OpenMythos) — 13.8k ⭐
- [Google Colab](https://colab.research.google.com) — GPU grátis
- [Vercel](https://vercel.com) — hospedagem do site

---

## 🤝 Contribuições

Melhorias, correções ou traduções são bem-vindas!

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/minha-melhoria`)
3. Commit (`git commit -m 'Adiciona melhoria'`)
4. Push (`git push origin feature/minha-melhoria`)
5. Abra um Pull Request

---

## 📝 Licença

MIT License — veja [LICENSE](LICENSE).

---

## ⭐ Créditos

- Arquitetura original: [Anthropic](https://www.anthropic.com)
- Implementação open-source: [@kyegomez](https://github.com/kyegomez/OpenMythos)
- Tutorial em português: [Seu nome aqui]

---

**Bons estudos! 🇧🇷**
