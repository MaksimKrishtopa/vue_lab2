new Vue({
  el: '#app',
  data: {
    column1: [],
    column2: [],
    column3: [],
    newCardTitle: '',
    column1Locked: false,
    column2Full1: false
  },
  computed: {
    column2Full() {
      return this.column2.length >= 5;
    }
  },
  mounted() {
    if (localStorage.getItem('notes')) {
      const savedData = JSON.parse(localStorage.getItem('notes'));
      this.column1 = savedData.column1;
      this.column2 = savedData.column2;
      this.column3 = savedData.column3;
      this.column1Locked = savedData.column1Locked;
      this.column2Full1 = savedData.column2Full1;
    }
  },
  methods: {
    addCard() {
      if (this.newCardTitle.trim() !== '') {
        if (this.column2Full) {
          this.column2Full1 = true;
          this.column1Locked = true; 
          this.column1.splice(0); 
          this.newCardTitle = ''; 
        } else if (!this.column1Locked && this.column1.length < 3) {
          this.column1.push({
            title: this.newCardTitle,
            items: [
              { text: 'Пункт 1', checked: false },
              { text: 'Пункт 2', checked: false },
              { text: 'Пункт 3', checked: false }
            ]
          });
          this.newCardTitle = '';
        }
        
        localStorage.setItem('notes', JSON.stringify({
          column1: this.column1,
          column2: this.column2,
          column3: this.column3,
          column1Locked: this.column1Locked,
        }));
      }
    },
    checkItem(card) {
      if (this.column1Locked) {
          return;
      }
      this.column2Full1 = false;

      const checkedCount = card.items.filter(item => item.checked).length;
      const totalCount = card.items.length;
      const completionPercentage = (checkedCount / totalCount) * 100;

      if (!card.moved) {
          card.savedCheckboxes = card.items.map(item => item.checked);
      }

      if (completionPercentage >= 50 && this.column1.includes(card)) {
          if (this.column2.length < 5) {
              this.column1.splice(this.column1.indexOf(card), 1);
              this.column2.push(card);
              card.moved = true;
          } else {
              this.column2Full1 = true;
              alert("Нельзя переместить карточку во второй столбец из-за достижения лимита.");
          }
      }

      if (this.column1Locked && this.column2.length === 5 && completionPercentage >= 50) {
          this.column2Full1 = true;
      }
  
      if (completionPercentage < 50 && this.column2.includes(card) && this.column1.length < 3) {
          const index1 = this.column2.indexOf(card);
          this.column2.splice(index1, 1);
          this.column1.push(card);
          card.moved = true; // Помечаем, что карточка была перемещена
      }
  
      if (completionPercentage < 100) {
          card.completed = false;
      }
  
      if (completionPercentage === 100 && !this.column3.includes(card)) {
          card.completed = true;
          card.lastCompleted = new Date().toLocaleString();
          if (this.column2.includes(card)) {
              this.column2.splice(this.column2.indexOf(card), 1);
          }
          this.column3.push(card);
          card.moved = true; // Помечаем, что карточка была перемещена
      } else if (completionPercentage === 100 && this.column3.includes(card)) {
          card.lastCompleted = new Date().toLocaleString();
      } else {
          card.lastCompleted = "";
      }
  
      if (completionPercentage < 100 && this.column3.includes(card)) {
          const index = this.column3.indexOf(card);
          this.column3.splice(index, 1);
          this.column2.push(card);
          card.moved = true; // Помечаем, что карточка была перемещена
      }
  
      // Блокируем чекбоксы, если карточка была перемещена
      if (card.moved) {
        // Блокируем только отмеченные чекбоксы
        card.items.forEach(item => {
            item.disabled = item.checked;
        });
    }

    localStorage.setItem('notes', JSON.stringify({
        column1: this.column1,
        column2: this.column2,
        column3: this.column3,
        column1Locked: this.column1Locked,
        column2Full1: this.column2Full1
    }));
},
    updateItemText(card, item, newText) {
      if (this.column1Locked) {
        return;
      }

      item.text = newText;
      localStorage.setItem('notes', JSON.stringify({
        column1: this.column1,
        column2: this.column2,
        column3: this.column3,
        column1Locked: this.column1Locked,
      }));
    },

    resetAllCards() {
      this.column1 = [];
      this.column2 = [];
      this.column3 = [];
      this.column1Locked = false;
      localStorage.removeItem('notes');
      localStorage.setItem('notes', JSON.stringify({
        column1: this.column1,
        column2: this.column2,
        column3: this.column3,
        column1Locked: this.column1Locked,
        column2Full1: this.column2Full1
      }));
    },
  }
});