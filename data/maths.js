/* sam quiz : banque de questions - Mathematiques */
window.SamBank = window.SamBank || [];
window.SamBank.push({
  id: "maths",
  name: "Mathématiques",
  category: "Sciences",
  icon: "📐",
  levels: {
    1: [
      {
        q: "Quelles sont les solutions de x² − 5x + 6 = 0 ?",
        c: ["2 et 3", "−2 et −3", "1 et 6", "−1 et −6"],
        a: 0,
        e: "x² − 5x + 6 = (x − 2)(x − 3), donc x = 2 ou x = 3."
      },
      {
        q: "Quelle est la dérivée de f(x) = x³ ?",
        c: ["x²", "3x²", "3x", "x⁴/4"],
        a: 1,
        e: "(xⁿ)' = n·xⁿ⁻¹, donc (x³)' = 3x²."
      },
      {
        q: "Combien vaut cos(π/3) ?",
        c: ["√3/2", "√2/2", "1/2", "0"],
        a: 2,
        e: "cos(π/3) = cos(60°) = 1/2."
      },
      {
        q: "Soit (uₙ) une suite arithmétique avec u₀ = 2 et de raison 3. Que vaut u₅ ?",
        c: ["15", "20", "14", "17"],
        a: 3,
        e: "uₙ = u₀ + n·r, donc u₅ = 2 + 5 × 3 = 17."
      },
      {
        q: "Quel est le discriminant de x² + 2x − 3 ?",
        c: ["16", "8", "−8", "4"],
        a: 0,
        e: "Δ = b² − 4ac = 4 − 4 × 1 × (−3) = 16."
      }
    ],
    2: [
      {
        q: "Quelle est la dérivée de f(x) = (2x + 1)(x − 3) ?",
        c: ["2x − 5", "4x + 5", "4x − 5", "2x + 1"],
        a: 2,
        e: "f(x) = 2x² − 5x − 3, donc f'(x) = 4x − 5."
      },
      {
        q: "Quelle est la somme des 10 premiers termes de la suite arithmétique 1 ; 3 ; 5 ; 7 ; ... ?",
        c: ["90", "100", "110", "55"],
        a: 1,
        e: "Le 10e terme vaut 19 et S = 10 × (1 + 19) / 2 = 100."
      },
      {
        q: "De combien de façons peut-on choisir 2 élèves parmi 5 ?",
        c: ["20", "5", "10", "25"],
        a: 2,
        e: "L'ordre ne compte pas : C(5,2) = 5 × 4 / 2 = 10."
      },
      {
        q: "Quel est l'ensemble des solutions de x² − 4x − 5 ≤ 0 ?",
        c: ["]−∞ ; −1] ∪ [5 ; +∞[", "[−1 ; 5]", "]−1 ; 5[", "[−5 ; 1]"],
        a: 1,
        e: "Les racines sont −1 et 5. Le trinôme est négatif entre les racines, bornes comprises."
      },
      {
        q: "Quelle est l'équation de la tangente à la courbe de f(x) = x² au point d'abscisse 1 ?",
        c: ["y = 2x − 1", "y = 2x + 1", "y = x − 1", "y = 2x"],
        a: 0,
        e: "f(1) = 1 et f'(1) = 2, donc y = 2(x − 1) + 1 = 2x − 1."
      }
    ],
    3: [
      {
        q: "Sur quel intervalle la fonction f(x) = x³ − 3x est-elle décroissante ?",
        c: ["]−∞ ; −1]", "[1 ; +∞[", "ℝ tout entier", "[−1 ; 1]"],
        a: 3,
        e: "f'(x) = 3x² − 3 = 3(x − 1)(x + 1), négative entre −1 et 1."
      },
      {
        q: "Soit une suite géométrique de premier terme u₀ = 3 et de raison 2. Que vaut u₀ + u₁ + u₂ + u₃ + u₄ ?",
        c: ["96", "93", "45", "48"],
        a: 1,
        e: "3 + 6 + 12 + 24 + 48 = 93, ou 3 × (2⁵ − 1) / (2 − 1)."
      },
      {
        q: "Pour quelles valeurs de m l'équation x² − 2mx + 1 = 0 a-t-elle une solution double ?",
        c: ["m = 0", "m = 1 uniquement", "m = 2", "m = 1 ou m = −1"],
        a: 3,
        e: "Δ = 4m² − 4 = 0 donne m² = 1, donc m = 1 ou m = −1."
      },
      {
        q: "Avec les chiffres 1, 2, 3, 4, 5, combien de nombres de 3 chiffres tous différents peut-on former ?",
        c: ["125", "10", "60", "120"],
        a: 2,
        e: "Arrangements : 5 × 4 × 3 = 60."
      },
      {
        q: "Quelle est la dérivée de f(x) = (x + 1) / (x − 2) ?",
        c: ["3 / (x − 2)²", "−3 / (x − 2)²", "1 / (x − 2)²", "(2x − 1) / (x − 2)²"],
        a: 1,
        e: "((x − 2) − (x + 1)) / (x − 2)² = −3 / (x − 2)²."
      }
    ]
  }
});
