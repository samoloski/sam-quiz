/* sam quiz : banque de questions - Physique-Chimie */
window.SamBank = window.SamBank || [];
window.SamBank.push({
  id: "physique",
  name: "Physique-Chimie",
  category: "Sciences",
  icon: "⚗️",
  levels: {
    1: [
      {
        q: "Quelle est l'unité de la force dans le Système International ?",
        c: ["Le joule", "Le newton", "Le watt", "Le pascal"],
        a: 1,
        e: "La force se mesure en newtons (N). Le joule mesure l'énergie, le watt la puissance, le pascal la pression."
      },
      {
        q: "Quelle est la loi d'Ohm pour un conducteur ohmique ?",
        c: ["U = R / I", "U = R × I", "U = I / R", "U = R + I"],
        a: 1,
        e: "La tension U (en V) est égale à la résistance R (en Ω) multipliée par l'intensité I (en A)."
      },
      {
        q: "Quelle quantité de matière représentent 36 g d'eau ? (M = 18 g/mol)",
        c: ["0,5 mol", "2 mol", "18 mol", "648 mol"],
        a: 1,
        e: "n = m / M = 36 / 18 = 2 mol."
      },
      {
        q: "Quelle est la relation entre le poids P et la masse m d'un corps ?",
        c: ["P = m / g", "P = m + g", "P = m × g", "P = g / m"],
        a: 2,
        e: "P = m × g, avec P en newtons, m en kilogrammes et g en N/kg."
      },
      {
        q: "Quel ion est responsable du caractère acide d'une solution ?",
        c: ["L'ion hydroxyde HO⁻", "L'ion sodium Na⁺", "L'ion chlorure Cl⁻", "L'ion oxonium H₃O⁺"],
        a: 3,
        e: "Une solution acide (pH inférieur à 7) contient plus d'ions oxonium H₃O⁺ que d'ions hydroxyde HO⁻."
      }
    ],
    2: [
      {
        q: "Une voiture roule à 72 km/h. Quelle est sa vitesse en m/s ?",
        c: ["7,2 m/s", "20 m/s", "25 m/s", "72 m/s"],
        a: 1,
        e: "Pour passer de km/h à m/s, on divise par 3,6 : 72 / 3,6 = 20 m/s."
      },
      {
        q: "Deux résistances de 10 Ω et 20 Ω sont montées en série. Quelle est la résistance équivalente ?",
        c: ["6,7 Ω", "15 Ω", "30 Ω", "200 Ω"],
        a: 2,
        e: "En série, les résistances s'additionnent : 10 + 20 = 30 Ω."
      },
      {
        q: "On dissout 0,2 mol de soluté dans 500 mL de solution. Quelle est la concentration molaire ?",
        c: ["0,1 mol/L", "0,4 mol/L", "2,5 mol/L", "100 mol/L"],
        a: 1,
        e: "C = n / V = 0,2 / 0,5 = 0,4 mol/L (500 mL = 0,5 L)."
      },
      {
        q: "Quelle est l'énergie cinétique d'un solide de masse 2 kg qui se déplace à 3 m/s ?",
        c: ["6 J", "9 J", "18 J", "3 J"],
        a: 1,
        e: "Ec = ½ × m × v² = 0,5 × 2 × 3² = 9 J."
      },
      {
        q: "Un appareil de 100 W fonctionne pendant 2 heures. Quelle énergie consomme-t-il ?",
        c: ["0,2 kWh", "2 kWh", "50 Wh", "0,5 kWh"],
        a: 0,
        e: "E = P × t = 100 W × 2 h = 200 Wh = 0,2 kWh."
      }
    ],
    3: [
      {
        q: "Quel est le pH d'une solution d'acide chlorhydrique (acide fort) à 0,01 mol/L ?",
        c: ["1", "2", "0,01", "12"],
        a: 1,
        e: "Pour un acide fort, pH = −log C = −log(0,01) = 2."
      },
      {
        q: "Un corps est lâché sans vitesse initiale en chute libre. Quelle est sa vitesse après 3 s ? (g = 10 m/s²)",
        c: ["3,3 m/s", "15 m/s", "30 m/s", "45 m/s"],
        a: 2,
        e: "En chute libre, v = g × t = 10 × 3 = 30 m/s."
      },
      {
        q: "Une force constante de 50 N déplace son point d'application de 4 m, dans sa propre direction et son propre sens. Quel est son travail ?",
        c: ["12,5 J", "54 J", "200 J", "46 J"],
        a: 2,
        e: "W = F × d × cos(0°) = 50 × 4 × 1 = 200 J."
      },
      {
        q: "Deux résistances de 6 Ω et 3 Ω sont montées en parallèle. Quelle est la résistance équivalente ?",
        c: ["9 Ω", "4,5 Ω", "2 Ω", "18 Ω"],
        a: 2,
        e: "R = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω."
      },
      {
        q: "Quelle masse de NaOH (M = 40 g/mol) faut-il dissoudre pour préparer 250 mL de solution à 0,1 mol/L ?",
        c: ["1 g", "4 g", "10 g", "0,1 g"],
        a: 0,
        e: "n = C × V = 0,1 × 0,25 = 0,025 mol, puis m = n × M = 0,025 × 40 = 1 g."
      }
    ]
  }
});
