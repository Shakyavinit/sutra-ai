// --- SUTRA AI Interactive Platform Core ---

document.addEventListener('DOMContentLoaded', () => {
  // Preset Data Matrix
  const PRESETS = {
    nyaya: {
      title: "Nyāya Pancha-Avayava Causal Deduction",
      latency: "11.2 ms",
      model: "sutra-nyaya-deductive-v3.4",
      shloka: {
        devanagari: "पर्वतो वह्निमान् धूमात् । यत्र यत्र धूमस्तत्र तत्र वह्निः यथा महानसम् ।",
        iast: "parvato vahnimān dhūmāt | yatra yatra dhūmastatra tatra vahniḥ yathā mahānasam |",
        ref: "Nyāya Sūtra 1.1.32 & Tarka Saṅgraha (Anumāna-Khaṇḍa)"
      },
      breakdown: [
        { label: "1. Pratijñā (Proposition)", text: "The hill possesses fire (Parvato vahnimān). Establishing the hypothesis." },
        { label: "2. Hetu (Invariable Reason)", text: "Because it possesses smoke (dhūmāt). The observable causal signal." },
        { label: "3. Udāharaṇa (Corroboration)", text: "Wherever there is smoke, there is fire, as in a kitchen hearth (Vyāpti invariant)." },
        { label: "4. Upanaya (Application)", text: "This hill exhibits smoke that is invariably accompanied by fire." },
        { label: "5. Nigamana (Conclusion)", text: "Therefore, this hill undeniably possesses fire (Pramāṇa verification passed)." }
      ],
      analogy: `// Modern Causal Bayesian Directed Acyclic Graph (DAG)
function verifyFireCausality(observables) {
  const vyaptiInvariant = (smoke, fire) => smoke ? (fire === true) : true;
  assert(vyaptiInvariant(observables.hasSmoke, observables.hasFire));
  return { status: "VALIDATED", fallaciesHetvabhasa: 0 };
}`
    },

    panini: {
      title: "Pāṇinian Context-Free Generative Grammar AST",
      latency: "7.8 ms",
      model: "sutra-panini-ast-v3.4",
      shloka: {
        devanagari: "वृद्धिर्यस्याचामादिस्तद् वृद्धम् । इको यणचि ।",
        iast: "vṛddhir yasyācām ādis tad vṛddham | iko yaṇ aci |",
        ref: "Pāṇini Aṣṭādhyāyī 1.1.1 & 6.1.77 (Sandhi Generative Rules)"
      },
      breakdown: [
        { label: "Morphological Rule", text: "Rule 6.1.77: 'iko yaṇ aci' -> High vowels [i, u, ṛ, ḷ] mutate into semivowels [y, v, r, l] when followed by any vowel (ac)." },
        { label: "Phonetic Set (Pratyāhāra)", text: "IK = {i, u, ṛ, ḷ} | YAN = {y, v, r, l} | AC = {all vowels} generated from Shiva Sūtras." },
        { label: "Deterministic Rewrite", text: "iti + atra -> ity + atra -> ityatra. Zero token hallucination." },
        { label: "AST Parse Result", text: "Subanta (Nominal stem) + Tiṅanta (Verbal inflexion) node graph created." }
      ],
      analogy: `// Chomsky Level-2 Deterministic Rewrite Engine
const SHIVA_SUTRAS = ["a_i_u_ṇ", "ṛ_ḷ_k", "e_o_ṅ", "ai_au_c", "ha_ya_va_ra_ṭ"];
function applySandhi(rootA, rootB) {
  if (isHighVowel(rootA.tail) && isVowel(rootB.head)) {
    return transformToSemivowel(rootA, rootB); // Non-statistical rule
  }
}`
    },

    yoga: {
      title: "Yoga Psychology & Neural Attention Suppression",
      latency: "14.6 ms",
      model: "sutra-yoga-cognitive-v3.4",
      shloka: {
        devanagari: "योगश्चित्तवृत्तिनिरोधः । तदा द्रष्टुः स्वरूपेऽवस्थानम् ।",
        iast: "yogaś citta-vṛtti-nirodhaḥ | tadā draṣṭuḥ svarūpe'vasthānam |",
        ref: "Patañjali Yoga Sūtras 1.2 - 1.3"
      },
      breakdown: [
        { label: "Semantic Synthesis", text: "Intelligence (Yoga) is the directed cessation (nirodha) of stochastic mental fluctuations (chitta-vṛttis)." },
        { label: "Five Fluctuations", text: "Pramāṇa (valid fact), Viparyaya (error), Vikalpa (delusion/hallucination), Nidrā (dormancy), Smṛti (memory)." },
        { label: "Transformer Parallel", text: "Applying dynamic soft-masking to low-confidence attention heads suppresses hallucination (Vikalpa-Nirodha)." }
      ],
      analogy: `// Self-Attention Entropy Regularization Layer
class NirodhaAttentionFilter extends Layer {
  forward(attentionWeights, entropyThreshold) {
    const stochasticNoise = calculateEntropy(attentionWeights);
    return attentionWeights.mask(stochasticNoise > entropyThreshold);
  }
}`
    },

    sankhya: {
      title: "Sāṅkhya Puruṣa-Prakṛti Dualism in Multi-Agent AI",
      latency: "13.1 ms",
      model: "sutra-sankhya-multiagent-v3.4",
      shloka: {
        devanagari: "मूलप्रकृतिरविकृतिर्महदाद्याः प्रकृतिविकृतयः सप्त । षोडशकस्तु विकारो न प्रकृतिर्न विकृतिः पुरुषः ॥",
        iast: "mūlaprakṛtir avikṛtir mahad-ādyāḥ prakṛti-vikṛtayaḥ sapta | ṣoḍaśakas tu vikāro na prakṛtir na vikṛtiḥ puruṣaḥ ||",
        ref: "Sāṅkhya Kārikā (Īśvarakṛṣṇa, Verse 3)"
      },
      breakdown: [
        { label: "Ontological Architecture", text: "Puruṣa: The pure non-acting conscious Observer / Evaluator agent. Immutable." },
        { label: "Prakṛti (Nature/Execution)", text: "The generative, dynamic substrate composed of 3 Gunas (Sattva: Clarity, Rajas: Activity, Tamas: Inertia)." },
        { label: "Multi-Agent Mapping", text: "Separates the LLM orchestrator (Observer) from compute-bound tool execution workers (Actors)." }
      ],
      analogy: `// Multi-Agent Actor-Critic Orchestrator
interface MultiAgentArch {
  purushaOrchestrator: AgentObserver; // Pure evaluation & reward supervisor
  prakritiWorkers: AgentExecutor[];   // Deterministic tool/code runners
}`
    }
  };

  // Sutra of the Day Corpus
  const SUTRA_CORPUS = [
    {
      devanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।",
      iast: "karmaṇy-evādhikāras te mā phaleṣu kadācana |",
      ref: "Bhagavad Gītā 2.47 • Causality & Intent",
      takeaway: "Decouple asynchronous event processing from downstream consumer acknowledgment."
    },
    {
      devanagari: "सत्यं ब्रूयात् प्रियं ब्रूयात् न ब्रूयात् सत्यमप्रियम् ।",
      iast: "satyaṁ brūyāt priyaṁ brūyāt na brūyāt satyam apriyam |",
      ref: "Manusmṛti 4.138 • Ethical Alignment",
      takeaway: "Multi-objective alignment: Model outputs must optimize for absolute truth with benign intent."
    },
    {
      devanagari: "विद्या ददाति विनयं विनयाद्याति पात्रताम् ।",
      iast: "vidyā dadāti vinayaṁ vinayād yāti pātratām |",
      ref: "Hitopadeśa • Progressive Calibration",
      takeaway: "High model confidence must be counter-balanced with humble confidence estimation."
    },
    {
      devanagari: "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते ।",
      iast: "na hi jñānena sadṛśaṁ pavitram iha vidyate |",
      ref: "Bhagavad Gītā 4.38 • Epistemic Purity",
      takeaway: "Unfiltered grounding data is the single determinant of model reasoning integrity."
    },
    {
      devanagari: "अथातो ब्रह्मजिज्ञासा ॥",
      iast: "athāto brahma-jijñāsā ||",
      ref: "Brahma Sūtras 1.1.1 • First Principles Investigation",
      takeaway: "Initialize neural exploration from the ground axiom before fine-tuning domain parameters."
    }
  ];

  // DOM Elements
  const presetButtons = document.querySelectorAll('.preset-btn');
  const terminalBody = document.getElementById('terminalBody');
  const userPromptInput = document.getElementById('userPromptInput');
  const runInferenceBtn = document.getElementById('runInferenceBtn');
  const copyOutputBtn = document.getElementById('copyOutputBtn');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');
  const activeModelLabel = document.getElementById('activeModelLabel');
  const execLatency = document.getElementById('execLatency');
  const refreshWisdomBtn = document.getElementById('refreshWisdomBtn');
  const wisdomQuote = document.getElementById('wisdomQuote');
  const wisdomRef = document.getElementById('wisdomRef');
  const wisdomTakeaway = document.getElementById('wisdomTakeaway');
  const codeTabs = document.querySelectorAll('.code-tab');
  const codeBlocks = document.querySelectorAll('.code-block');

  // Render Preset Function
  function renderPreset(presetKey) {
    const data = PRESETS[presetKey];
    if (!data) return;

    if (activeModelLabel) activeModelLabel.textContent = data.model;
    if (execLatency) execLatency.textContent = `Latency: ${data.latency}`;

    let html = `
      <div class="output-block">
        <div class="shloka-box">
          <div class="shloka-devanagari">${data.shloka.devanagari}</div>
          <div class="shloka-iast">${data.shloka.iast}</div>
          <div class="step-detail" style="margin-top:6px; color:var(--accent-amber); font-weight:600;">
            Source: ${data.shloka.ref}
          </div>
        </div>

        <div class="breakdown-section">
          <span class="section-label-chip">Epistemological &amp; Formal Breakdown</span>
          <div class="step-chain">
    `;

    data.breakdown.forEach(item => {
      html += `
        <div class="chain-step">
          <div class="step-num">${item.label}</div>
          <div class="step-content">${item.text}</div>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <div class="breakdown-section">
          <span class="section-label-chip">Modern Systems Analogy &amp; Verified Implementation</span>
          <div class="code-analogy-box">
            <pre><code>${data.analogy}</code></pre>
          </div>
        </div>
      </div>
    `;

    terminalBody.innerHTML = html;
  }

  // Handle Preset Click
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetKey = btn.getAttribute('data-preset');
      const title = btn.querySelector('.preset-title-text').textContent;
      userPromptInput.value = title;
      renderPreset(presetKey);
    });
  });

  // Handle User Input Execution
  runInferenceBtn.addEventListener('click', () => {
    const query = userPromptInput.value.trim();
    if (!query) return;

    terminalBody.innerHTML = `
      <div class="output-block" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:320px; gap:16px;">
        <div class="chip-pulse" style="width:20px; height:20px;"></div>
        <div style="font-family:var(--font-mono); color:var(--accent-cyan); font-size:0.95rem;">
          Evaluating query against 1.42M Sutra Knowledge Base...
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted);">
          Resolving Pāṇini Sandhi AST &bull; Checking Nyāya Vyāpti Invariants
        </div>
      </div>
    `;

    setTimeout(() => {
      // Find matching preset or generate intelligent synthesis
      const lower = query.toLowerCase();
      let matchedKey = 'nyaya';
      if (lower.includes('panini') || lower.includes('grammar') || lower.includes('shiva') || lower.includes('ast')) {
        matchedKey = 'panini';
      } else if (lower.includes('yoga') || lower.includes('chitta') || lower.includes('mind') || lower.includes('attention')) {
        matchedKey = 'yoga';
      } else if (lower.includes('sankhya') || lower.includes('purusha') || lower.includes('dualism') || lower.includes('agent')) {
        matchedKey = 'sankhya';
      }
      renderPreset(matchedKey);
    }, 450);
  });

  // Handle Enter Key in Prompt Input
  userPromptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      runInferenceBtn.click();
    }
  });

  // Copy Output
  copyOutputBtn.addEventListener('click', () => {
    const textToCopy = terminalBody.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalSpan = copyOutputBtn.querySelector('span');
      originalSpan.textContent = "Copied!";
      copyOutputBtn.style.borderColor = "var(--accent-emerald)";
      setTimeout(() => {
        originalSpan.textContent = "Copy";
        copyOutputBtn.style.borderColor = "var(--border-subtle)";
      }, 2000);
    });
  });

  // Clear Console
  clearConsoleBtn.addEventListener('click', () => {
    terminalBody.innerHTML = `
      <div style="color:var(--text-muted); font-size:0.85rem; padding:20px; text-align:center;">
        Terminal cleared. Select a prompt from the left panel or type an inquiry above.
      </div>
    `;
  });

  // Random Wisdom Sutra Generator
  let currentWisdomIdx = 0;
  refreshWisdomBtn.addEventListener('click', () => {
    currentWisdomIdx = (currentWisdomIdx + 1) % SUTRA_CORPUS.length;
    const item = SUTRA_CORPUS[currentWisdomIdx];
    wisdomQuote.textContent = `"${item.devanagari}"`;
    wisdomRef.textContent = item.ref;
    wisdomTakeaway.textContent = `Engineering Takeaway: ${item.takeaway}`;
  });

  // SDK Code Tabs
  codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeTabs.forEach(t => t.classList.remove('active'));
      codeBlocks.forEach(b => b.classList.remove('active'));

      tab.classList.add('active');
      const targetLang = tab.getAttribute('data-tab');
      const activeBlock = document.getElementById(`code-${targetLang}`);
      if (activeBlock) activeBlock.classList.add('active');
    });
  });

  // Initial Load
  renderPreset('nyaya');
});
