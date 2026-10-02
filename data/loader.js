/* sam quiz : liste des matieres a charger (ajouter un nom ici pour chaque nouvelle matiere) */
(function () {
  var subjects = ["maths", "physique"];
  subjects.forEach(function (name) {
    document.write('<script src="data/' + name + '.js" charset="utf-8"><\/script>');
  });
})();
