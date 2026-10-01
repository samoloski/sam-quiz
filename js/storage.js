/* sam quiz : sauvegarde des donnees dans localStorage */
(function () {
  var KEY = "samquiz:v1";

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && Array.isArray(data.subjects)) return data;
      }
    } catch (e) {
      console.error("Lecture impossible :", e);
    }
    return { subjects: [] };
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Sauvegarde impossible :", e);
      return false;
    }
  }

  function findSubject(data, id) {
    for (var i = 0; i < data.subjects.length; i++) {
      if (data.subjects[i].id === id) return data.subjects[i];
    }
    return null;
  }

  var SamStore = {
    getSubjects: function () {
      return load().subjects;
    },

    getSubject: function (id) {
      return findSubject(load(), id);
    },

    getCategories: function () {
      var seen = {};
      var list = [];
      load().subjects.forEach(function (s) {
        if (s.category && !seen[s.category]) {
          seen[s.category] = true;
          list.push(s.category);
        }
      });
      return list;
    },

    addSubject: function (name, category) {
      var data = load();
      var subject = {
        id: uid(),
        name: String(name).trim(),
        category: String(category || "").trim() || "Autres",
        cards: [],
        questions: []
      };
      data.subjects.push(subject);
      save(data);
      return subject;
    },

    deleteSubject: function (id) {
      var data = load();
      data.subjects = data.subjects.filter(function (s) {
        return s.id !== id;
      });
      return save(data);
    },

    addCard: function (subjectId, front, back) {
      var data = load();
      var subject = findSubject(data, subjectId);
      if (!subject) return null;
      var card = { id: uid(), front: String(front).trim(), back: String(back).trim() };
      subject.cards.push(card);
      save(data);
      return card;
    },

    deleteCard: function (subjectId, cardId) {
      var data = load();
      var subject = findSubject(data, subjectId);
      if (!subject) return false;
      subject.cards = subject.cards.filter(function (c) {
        return c.id !== cardId;
      });
      return save(data);
    },

    addQuestion: function (subjectId, question, choices, answerIndex) {
      var data = load();
      var subject = findSubject(data, subjectId);
      if (!subject) return null;
      var q = {
        id: uid(),
        question: String(question).trim(),
        choices: choices.map(function (c) { return String(c).trim(); }),
        answer: answerIndex
      };
      subject.questions.push(q);
      save(data);
      return q;
    },

    deleteQuestion: function (subjectId, questionId) {
      var data = load();
      var subject = findSubject(data, subjectId);
      if (!subject) return false;
      subject.questions = subject.questions.filter(function (q) {
        return q.id !== questionId;
      });
      return save(data);
    }
  };

  window.SamStore = SamStore;
})();
