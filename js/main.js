Vue.component('note-card', {
    props: {
        note: Object,
        columnIndex: Number,
        onMoveNote: Function
    },
    template: `
        <div class="note-card">
            <h3>{{ note.title }}</h3>
            <ul>
                <li v-for="(item, index) in note.items" :key="index">
                    <input type="checkbox" v-model="item.checked" @change="checkItem()">
                    {{ item.text }}
                </li>
            </ul>
            <div v-if="columnIndex === 2">
                <p>Last Updated: {{ note.lastUpdated }}</p>
            </div>
        </div>
    `,
    methods: {
        checkItem() {
            if (this.columnIndex < 2 && this.checkCompletionPercentage() > 50) {
                this.onMoveNote(this.note, this.columnIndex + 1);
            }
            if (this.columnIndex === 1 && this.checkCompletionPercentage() === 100) {
                this.onMoveNote(this.note, 2);
            }
            if (this.columnIndex === 2 && this.checkCompletionPercentage() === 100) {
                this.onMoveNote(this.note, 3);
            }
        },
        checkCompletionPercentage() {
            const completedItems = this.note.items.filter(item => item.checked).length;
            return (completedItems / this.note.items.length) * 100;
        }
    }
});

Vue.component('app-board', {
    data() {
        return {
            columns: [
                { name: 'Запланировано', limit: 5 },
                { name: 'В работе', limit: 3 },
                { name: 'Выполнено', limit: Infinity }
            ],
            notes: []
        };
    },
    template: `
        <div class="app-board">
            <div v-for="(column, index) in columns" :key="index" class="column">
                <h2>{{ column.name }}</h2>
                <div class="note-list">
                    <note-card
                        v-for="note in getNotesInColumn(index)"
                        :key="note.title"
                        :note="note"
                        :columnIndex="index"
                        @onMoveNote="moveNote"
                    ></note-card>
                </div>
            </div>
            <button @click="createNote" v-if="columns[0].limit > this.getNotesInColumn(0).length">Создать Заметку</button>
            <button @click="clearAllNotes">Очистить все заметки</button>
        </div>
    `,
    methods: {
        getNotesInColumn(columnIndex) {
            return this.notes.filter((note) => this.getColumnIndex(note) === columnIndex);
        },
        getColumnIndex(note) {
            const index = this.columns.findIndex((column) => column.name === note.title);
            return index !== -1 ? index : 0;
        },
        moveNote(note, targetColumn) {
            const sourceColumn = this.getColumnIndex(note);
            if (sourceColumn < targetColumn) {
                if (targetColumn === 2 && this.getNotesInColumn(2).length === this.columns[2].limit) {
                    return;
                }
            }
            if (sourceColumn > targetColumn) {
                if (sourceColumn === 0 && this.getNotesInColumn(1).length === this.columns[1].limit) {
                    return;
                }
            }

            this.notes.splice(this.notes.indexOf(note), 1);
            this.notes.splice(this.getInsertIndex(targetColumn), 0, note);
            note.lastUpdated = new Date().toLocaleString();
            this.saveToLocalStorage();
        },
        getInsertIndex(targetColumn) {
            const notesInColumn = this.getNotesInColumn(targetColumn);
            return notesInColumn.length === 0 ? 0 : this.notes.indexOf(notesInColumn[0]);
        },
        createNote() {
            if (this.columns[0].limit > this.getNotesInColumn(0).length) {
                const newNote = {
                    title: 'Новая Заметка',
                    items: [
                        { text: 'Задача 1', checked: false },
                        { text: 'Задача 2', checked: false },
                        { text: 'Задача 3', checked: false }
                    ],
                    lastUpdated: null
                };
                this.notes.push(newNote);
                this.saveToLocalStorage();
            }
        },
        clearAllNotes() {
            this.notes = [];
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem('notes', JSON.stringify(this.notes));
        }
    },
    created() {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
        } else {
            this.createNote(); // Automatically create the initial note if no saved notes found
        }
    }
});

let app = new Vue({
    el: '#app',
    template: '<app-board></app-board>'
});
