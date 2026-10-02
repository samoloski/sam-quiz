/* sam quiz : banque de questions - SVT */
window.SamBank = window.SamBank || [];
window.SamBank.push({
  id: "svt",
  name: "SVT",
  category: "Sciences",
  icon: "🧬",
  levels: {
    1: [
      {
        q: "Quel organite de la cellule végétale réalise la photosynthèse ?",
        c: ["La mitochondrie", "Le chloroplaste", "Le noyau", "La vacuole"],
        a: 1,
        e: "Les chloroplastes contiennent la chlorophylle, qui capte la lumière pour fabriquer des sucres."
      },
      {
        q: "Qui est considéré comme le père de la génétique ?",
        c: ["Pasteur", "Darwin", "Mendel", "Lamarck"],
        a: 2,
        e: "Gregor Mendel a énoncé les lois de l'hérédité à partir de ses croisements de pois."
      },
      {
        q: "Quelle molécule porte l'information génétique ?",
        c: ["L'ADN", "Le glucose", "L'hémoglobine", "L'amidon"],
        a: 0,
        e: "L'ADN (acide désoxyribonucléique) est le support de l'information génétique."
      },
      {
        q: "Combien de chromosomes possède une cellule humaine non sexuelle ?",
        c: ["23", "44", "48", "46"],
        a: 3,
        e: "Une cellule humaine ordinaire possède 23 paires de chromosomes, soit 46 chromosomes."
      },
      {
        q: "Dans quel organe se fait l'essentiel de l'absorption des nutriments ?",
        c: ["L'estomac", "L'intestin grêle", "Le gros intestin", "L'œsophage"],
        a: 1,
        e: "La paroi de l'intestin grêle est très plissée (villosités), ce qui favorise l'absorption."
      }
    ],
    2: [
      {
        q: "Que produit une mitose à partir d'une cellule mère ?",
        c: [
          "Deux cellules filles identiques à la cellule mère",
          "Quatre cellules à moitié moins de chromosomes",
          "Une seule cellule plus grosse",
          "Deux cellules différentes de la cellule mère"
        ],
        a: 0,
        e: "La mitose conserve le nombre de chromosomes : les deux cellules filles sont identiques à la cellule mère."
      },
      {
        q: "Que produit une méiose ?",
        c: [
          "Deux cellules diploïdes",
          "Quatre cellules haploïdes",
          "Une cellule triploïde",
          "Deux cellules identiques à la cellule mère"
        ],
        a: 1,
        e: "La méiose donne quatre cellules haploïdes (n chromosomes), qui deviennent des gamètes."
      },
      {
        q: "Quelles cellules sanguines participent à la défense de l'organisme ?",
        c: ["Les globules rouges", "Les plaquettes", "Les globules blancs", "Le plasma"],
        a: 2,
        e: "Les globules blancs (leucocytes) assurent la défense contre les microbes."
      },
      {
        q: "Que consomme et que produit la respiration cellulaire ?",
        c: [
          "Elle consomme du CO₂ et produit du dioxygène",
          "Elle consomme du dioxygène et du glucose, et produit du CO₂ et de l'énergie",
          "Elle consomme de l'eau et produit de l'azote",
          "Elle ne consomme rien"
        ],
        a: 1,
        e: "Respiration : glucose + dioxygène donnent CO₂ + eau + énergie utilisable par la cellule."
      },
      {
        q: "On croise deux hybrides Aa × Aa (A dominant). Quelle proportion de descendants a le phénotype récessif ?",
        c: ["1/4", "1/2", "3/4", "Aucun"],
        a: 0,
        e: "Les descendants sont 1/4 AA, 2/4 Aa et 1/4 aa. Seuls les aa (1/4) ont le phénotype récessif."
      }
    ],
    3: [
      {
        q: "À quoi sert le croisement-test (test-cross) ?",
        c: [
          "À créer une nouvelle espèce",
          "À déterminer le génotype d'un individu de phénotype dominant",
          "À mesurer la taille d'un chromosome",
          "À repérer les mutations de l'ADN"
        ],
        a: 1,
        e: "On croise l'individu avec un homozygote récessif : les descendants révèlent son génotype."
      },
      {
        q: "Quel phénomène de la méiose crée de nouvelles combinaisons d'allèles sur un même chromosome ?",
        c: ["La mitose", "La fécondation", "La transcription", "Le crossing-over"],
        a: 3,
        e: "Lors du crossing-over, les chromosomes homologues échangent des morceaux : c'est le brassage intrachromosomique."
      },
      {
        q: "Quel est l'effet d'un vaccin ?",
        c: [
          "Il détruit directement les microbes",
          "Il remplace les globules blancs",
          "Il stimule l'immunité et crée des cellules mémoire sans provoquer la maladie",
          "Il rend le corps résistant à tous les microbes"
        ],
        a: 2,
        e: "Le vaccin contient un antigène inoffensif : l'organisme fabrique des cellules mémoire prêtes à réagir."
      },
      {
        q: "Un individu AaBb (gènes indépendants) produit combien de types de gamètes ?",
        c: ["2", "3", "4", "16"],
        a: 2,
        e: "AB, Ab, aB et ab : 4 types de gamètes, en proportions égales."
      },
      {
        q: "Quelles cellules le VIH détruit-il principalement ?",
        c: ["Les lymphocytes T4", "Les globules rouges", "Les cellules du foie", "Les neurones"],
        a: 0,
        e: "Le VIH infecte et détruit les lymphocytes T4, qui coordonnent les défenses de l'organisme."
      }
    ]
  }
});
