const kbcontainer = document.getElementById('kbcontainer');
const kbclose = document.getElementById('kbclose');
const keyboard = document.getElementById('keyboard');
const switchlayout = document.getElementById('switchlayout');
const suggestions = document.getElementById('suggestions');
const codeMirror = easyMDE.codemirror;
var codeMirrorElement = document.querySelector('.CodeMirror');

let kbenabled = true;

kbclose.addEventListener('click', () => {
	if(kbenabled) {
		kbenabled = false;
		kbcontainer.style.display = 'none';
		kbclose.innerHTML = 'हिंदी कीबोर्ड दिखाएं';
	}
	else {
		kbenabled = true;
		kbcontainer.style.display = 'block';
		kbclose.innerHTML = 'हिंदी कीबोर्ड बंद करें';
	}
})


// Define keyboard layouts
const layout1 = [
	['क', 'ख', 'ग', 'घ', 'ङ','अ', 'आ', 'इ', 'ई', 'ज्ञ'],
	['च', 'छ', 'ज', 'झ', 'ञ','उ', 'ऊ', 'ए', 'ऐ', 'त्र'],
	['ट', 'ठ', 'ड', 'ढ', 'ण','ओ', 'औ', 'अं', 'अः', 'क्ष'],
	['त', 'थ', 'द', 'ध', 'न','्', 'ा', 'ि', 'ी', 'श्र'], 
	['प', 'फ', 'ब', 'भ', 'म','ु', 'ू', 'े', 'ै', 'ऋ'],
	['य', 'र', 'ल', 'व', 'श','ो', 'ौ', 'ं', 'ः', 'ळ'],
	['ष', 'स', 'ह', ',', '।','ृ', '्र', 'ँ', 'ॅ', 'र्']
	
];

const layout2 = [
	['०', '१', '२', '३', '४','५', '६', '७', '८', '९'],
	['~', '!', '@', '#', '$','%', '&', '*', '(', ')'],
	['-', '_', '=', '+', '{','}', '[', ']', '|', '\\'],
	[';', ':', '"', '<', '>', '?', '/', '॥', 'ॡ', 'ॢ'],
	['ॐ', 'ॱ', 'ॲ', 'ॳ', 'ॴ','ॵ', 'ॶ', 'ॷ', 'ॸ', 'ॹ'],
	['•', '⊙', '◆', '★', '❖', '✱','✦', '■', '☑', '☒'],
	['➜', '▲', '🔵', '🟢', '🟠', '🔴', '🙏', '₹', '❝', '❞']
	
];

const layout3 = [
	'➤', '␣', '⬅', '↵'
]

let suggestedwords = [
	'?','?','?','?'
]

//get the file data/suggest.json and create an array
let sfile = new XMLHttpRequest();
sfile.open("GET", "suggest.json", false);
sfile.send(null);
let suggestdata = JSON.parse(sfile.responseText);
let suggestdataArray = Object.entries(suggestdata);

// console.log(suggestdataArray);

function searchAndGetTopWords(searchStr, wordFreqArray) {
	let topWords =  ['?','?','?','?'];
	suggestedwords = ['?','?','?','?'];

	if(!searchStr) {
		return;
	}

	// Filter the word-frequency pairs based on the search string
	const filteredPairs = wordFreqArray.filter(pair => pair[0].startsWith(searchStr));
  
	// Sort the filtered pairs in descending order of frequency
	filteredPairs.sort((a, b) => b[1] - a[1]);

	//check if not found
	if (filteredPairs.length !== 0) {
		topWords = filteredPairs.slice(0, 4);
	}
  
	// return filteredPairs.slice(0, 4);
	let children = suggestions.children;
	for (let i = 0; i < topWords.length; i++) {
		children[i].textContent = topWords[i][0];
		suggestedwords[i] = topWords[i][0];
		// console.log(children[i].textContent);
	}

  }

let wordToSearch = '';
let currentLayout = 0;

// Create keyboard keys
function createKeyboard(layout) {
    keyboard.innerHTML = '';

	for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 10; j++) {
            const key = document.createElement('div');
            key.classList.add('key');
            key.textContent = layout[i][j];

            key.addEventListener('click', () => {
				if(!kbenabled) { return; }
				let cursorPosition = codeMirror.getCursor();

				codeMirror.replaceSelection(key.textContent);

				wordToSearch += key.textContent;
				searchAndGetTopWords(wordToSearch, suggestdataArray);
				// codeMirror.focus();
				setTimeout(function() {
                    codeMirror.focus();
                }, 100);
				
				codeMirror.setCursor({ line: cursorPosition.line, ch: cursorPosition.ch + key.textContent.length });
            });

            keyboard.appendChild(key);
        }
    }
}

for (let k = 0; k < 4; k++) {
	const key = document.createElement('div');
	key.classList.add('key');
	key.textContent = suggestedwords[k];

	key.addEventListener('click', () => {
		if(!kbenabled) { return; }

		if(key.textContent != '?'){
			let cursorPosition = codeMirror.getCursor();

			codeMirror.deleteH(-wordToSearch.length, "char");
			codeMirror.replaceSelection(key.textContent + ' ');

			wordToSearch = '';
// 			codeMirror.focus();
				setTimeout(function() {
                    codeMirror.focus();
                }, 100);
		}
	});

	suggestions.appendChild(key);
}

for (let k = 0; k < 4; k++) {
	const key = document.createElement('div');
	key.classList.add('key');
	key.textContent = layout3[k];

	key.addEventListener('click', () => {
		if(!kbenabled) { return; }

		if(key.textContent === '⬅'){
			codeMirror.deleteH(-1, "char");
			wordToSearch = wordToSearch.slice(0, -1);
			searchAndGetTopWords(wordToSearch, suggestdataArray);
		}
		else if(key.textContent === '↵'){
			codeMirror.replaceSelection('\n');
			wordToSearch = '';
		}
		else if(key.textContent === '➤'){
			currentLayout = (currentLayout + 1) % 2;
			if (currentLayout === 0) {
				createKeyboard(layout1);
			} else {
				createKeyboard(layout2);
			}
		}
		else if(key.textContent === '␣'){
			codeMirror.replaceSelection(' ');
			wordToSearch = '';
		}

// 		codeMirror.focus();
		setTimeout(function() {
            codeMirror.focus();
        }, 100);

	});

	switchlayout.appendChild(key);
}

//capture keystrokes
const subs1 = [
	['k', 'K', 'g', 'G', 'ङ','A', 'आ', 'इ', 'ई', 'ज्ञ'],
	['c', 'C', 'j', 'J', 'ञ','उ', 'ऊ', 'ए', 'ऐ', 'त्र'],
	['T', 'ठ', 'ड', 'ढ', 'N','ओ', 'औ', 'अं', 'अः', 'X'],
	['t', 'थ', 'd', 'D', 'n','`', 'a', 'i', 'I', 'x'], 
	['p', 'f', 'b', 'B', 'm','u', 'U', 'e', 'E', 'R'],
	['y', 'r', 'l', 'v', 'S','o', 'O', 'M', 'H', 'L'],
	['ष', 's', 'h', ',', '.','ृ', '्र', 'ँ', 'ॅ', 'र्']
	
];

const layout4 = [
	'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
	'ङ', 'ड', 'ढ', 'ठ', 'थ', 'ञ', 'ष', 'त्र', 'ज्ञ', 'ृ', '्र', 'ँ', 'ॅ', 'र्'
];

const subs3 = [
	'A', 'i', 'I', 'y', 'Y', 'e', 'E', 'o', 'O', 'm', 'h',
	'l', 'd', 'D', 't', 'T', 'n', 's', 'z', 'g', 'R', 'Z', 'N', 'Q', 'r'
];

const subs2 = [
	['0', '1', '2', '3', '4','5', '6', '7', '8', '9'],
	['~', '!', '@', '#', '$','%', '&', '*', '(', ')'],
	['-', '_', '=', '+', '{','}', '[', ']', '|', '\\'],
	[';', ':', '"', '<', '>', '?', '/', '॥', 'ॡ', 'ॢ'],
	['ॐ', 'ॱ', 'ॲ', 'ॳ', 'ॴ','ॵ', 'ॶ', 'ॷ', 'ॸ', 'ॹ'],
	['•', '⊙', '◆', '★', '❖', '✱','✦', '■', '☑', '☒'],
	['➜', '▲', '🔵', '🟢', '🟠', '🔴', '🙏', '₹', '❝', '❞']
	
];


document.addEventListener('keydown', (event) => {
	if(!kbenabled) { return; }
	if(event.ctrlKey) {	return;	}

	let skey = '';
	for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 10; j++) {
			if (event.key === subs1[i][j]) {
				skey = layout1[i][j];
				break;
			}
			if (event.key === subs2[i][j]) {
				skey = layout2[i][j];
				break;
			}
		}
	}
	// console.log(event.code);
	if(event.code == 'Space' || event.code == 'Enter' || event.code == 'NumpadEnter') {
		wordToSearch = '';
	}
	// console.log(event.key);
	
	if (event.altKey) {
		for (let i = 0; i < subs3.length; i++) {
			// console.log(event.key, skey);
			if (event.key === subs3[i]) {
				skey = layout4[i];
				break;
			}
		}
	}

	if (event.code.includes('Numpad')) {
		let sug = 0;
		if(event.code === 'Numpad1') {sug = 1;}
		if(event.code === 'Numpad2') {sug = 2;}
		if(event.code === 'Numpad3') {sug = 3;}
		if(event.code === 'Numpad4') {sug = 4;}

		if(sug === 0) {return;}
		if(sug > 4) {return;}

		event.preventDefault();

		let sugtext = suggestedwords[sug-1];
		if(sugtext == '?'){return;}

		codeMirror.deleteH(-wordToSearch.length, "char");
		codeMirror.replaceSelection(sugtext + ' ');
		wordToSearch = '';

	}else {

		if(skey) {
			event.preventDefault();
			codeMirror.replaceSelection(skey);

			wordToSearch += skey;
			searchAndGetTopWords(wordToSearch, suggestdataArray);
		}
		skey = '';
	}
});

// Display initial layout
createKeyboard(layout1);

function dispMap(cols) {
	let maplayout = 	[['k', 'K', 'g', 'G', 'l'],
	['c', 'C', 'j', 'J', 'Alt-n'],
	['T', 'Alt-t', 'Alt-d', 'Alt-Shift-d', 'N'],
	['t', 'Alt-Shift-t', 'd', 'D', 'n'],
	['p', 'f', 'b', 'B', 'm'],
	['y', 'r', 'l', 'v', 'S'],
	['Alt-s', 's', 'h', 'X', 'Alt-z'],
	['Alt-g', 'x', 'R', 'L'],
	['A', 'Alt-Shift-a', 'Alt-i', 'Alt-Shift-i'],
	['Alt-y', 'Alt-Shift-y', 'Alt-e', 'Alt-Shift-e'],
	['Alt-o', 'Alt-Shift-o', 'Alt-m', 'Alt-h'],
	['`', 'a', 'i', 'I'], 
	['u', 'U', 'e', 'E'],
	['o', 'O', 'M', 'H'],
	['Alt-Shift-r', 'Alt-Shift-z', 'Alt-Shift-n', 'Alt-Shift-q', 'Alt-r', '.'],
	['0-9', 'Numpad 1 - Numpad 4']];

	let mapsubs =[['क', 'ख', 'ग', 'घ', 'ङ'],
	['च', 'छ', 'ज', 'झ', 'ञ'],
	['ट', 'ठ', 'ड', 'ढ', 'ण'],
	['त', 'थ', 'द', 'ध', 'न'],
	['प', 'फ', 'ब', 'भ', 'म'],
	['य', 'र', 'ल', 'व', 'श'],
	['ष', 'स', 'ह', 'क्ष', 'त्र'],
	['ज्ञ', 'श्र', 'ऋ', 'ळ'],
	['अ', 'आ', 'इ', 'ई'],
	['उ', 'ऊ', 'ए', 'ऐ'],
	['ओ', 'औ', 'अं', 'अः'],
	['्', 'ा', 'ि', 'ी'],
	['ु', 'ू', 'े', 'ै'],
	['ो', 'ौ', 'ं', 'ः'],
	['ृ', '्र', 'ँ', 'ॅ', 'र्', '।'],
	['०-९', 'सुझाव १ - सुझाव ४']];

	let out = '';

	for (let i = 0; i < maplayout.length; i++) {
		let row = '';
		for (let j = 0; j < maplayout[i].length; j++) {
			row += '<span class="keydisp">' + mapsubs[i][j] + ' ➜ ' + maplayout[i][j] + '</span>';
		}
		out += '<div class="row">' + row + '</div>';
	}

	return out;
}