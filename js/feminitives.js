// Copyright (C) 2016-2017, Maxim Lihachev, <envrm@yandex.ru>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// [ ] TODO: валидация

//------------------------------------------------------------------------------

'use strict';

//------------------------------------------------------------------------------

//Иерархия элементов на странице
var HTML = {
	container: "",
	_select:    function(element) { return document.getElementById(this.container + "-" + element); },
	input:      function() { return this._select("word"); },
	button:     function() { return this._select("convert"); },
	dict:       function() { return this._select("dict"); },
	content:    function() { return this._select("content"); },
	full:       function() { return this._select("full"); },
	help:       function() { return this._select("help"); },
	image:      function() { return this._select("image"); },
};

//Вывод справки с примерами использования
function show_help() {
	HTML.vis(HTML.help());
	HTML.vis(HTML.content());
}

//Смена названия по клику
function swap_title(id) {
	var e = document.getElementById(id);
	if(e.style.display == 'inline') {
		e.style.display = 'none';
	} else {
		e.style.display = 'inline';
	}
}

HTML.vis = function(e, v) {
	if (v !== undefined) {
		e.style.visibility = v;
	} else {
		e.style.visibility = e.style.visibility === "visible" ? "hidden" : "visible";
	}
}

//Инициализация документа
HTML.init = function(root) {
	//Задание базового id для всех элементов
	this.container = root;

	//Конвертирование по нажатию <Enter>
	this.input().addEventListener('keyup', event => {
		event.preventDefault();
		event.keyCode == 13 && tr();
	});

	//Конвертирование по нажатию кнопки
	this.button().onclick = () => tr();
};

//------------------------------------------------------------------------------

//Правила создания феминитивов
var FEM = {};

FEM.endings = {
	'ка'   : [
			['[аеёо]р', 0],
			['[её]т', 0], //авторитет -> авторитетка
			['а[ншб]', 0], //кран -> кранка, краб -> крабка
			['ец', 2], //канадец -> канадка
			['и[лр]', 0], //библиофил -> библиофилка, командир -> командирка
			['ин', 1], //татарин -> татарка
			['ль', 1], //создатель -> создателка
			['о[тн]', 0], //гот -> готка, адрон -> адронка
			['рг', 1],
			['[ус]т', 0], //специалист -> специалистка
			['у[нйп]', 0] //колдун -> колдунка
		],
	'чка' : [
			['[ае]к', 1] //левак -> левачка, человек -> человечка
		],
	'ина'  : [
			['ас', 0],
			['уй', 1], //буй -> буина
			['уд', 0], //сосуд -> сосудина
			['ил', 0]  //библиофил -> библиофилина
		],
	'иха'  : [
			['[аеёов]р', 0], //автор -> авториха
			['а[чб]', 0], //врач -> врачиха, краб -> крабиха
			['ец', 2], //канадец -> канадиха
			['и[лр]', 0], //библиофил -> библиофилиха, командир -> командириха
			['ль', 1], //создатель -> создателиха
			['рк', 0], //кварк -> кваркиха
			['о[гдтнп]', 0], //гот -> готиха, адрон -> адрониха, биолог -> биологиха, метод -> методиха, клоп -> клопиха
			['у[дпт]', 0], //труп -> трупиха, сосуд -> сосудиха
			['уй', 1] //буй -> буиха
		],
	'иня'  : [
			['[аеёов]р', 0],
			['[её]т', 2], //авторитет -> авторитиня
			['[оиы]к', 0], //язык -> языкиня
			['а[вбкфч]', 0], //левак -> левакиня, граф -> графиня, врач -> врачиня, краб -> крабиня, состав -> составиня
			['во', 1], //существо -> существиня
			['ек', 0], //человек -> человекиня
			['ец', 2], //канадец -> канадиня
			['ил', 0], //библиофил -> библиофилиня
			['ль', 1], //создатель -> создателиня
			['о[дг]', 0], //биолог -> биологиня
			['од', 0], //метод -> методиня
			['р[гк]', 0], //кварк -> кваркиня
			['ро', 1], //ведро -> ведриня
			['со', 1], //колесо -> колесиня
			['сс', 0], //процесс -> процессиня
			['[кс]т', 0], //специалист -> специалистиня, объект -> объектиня
			['уй', 1], //буй -> буиня
			['у[тпх]', 0] //труп -> трупиня
		],
	'киня' : [
			['[аеёо]р', 0],
			['ок', 0],
			['ст', 0], //специалист -> специалисткиня
			['ан', 0],
			['ил', 0], //библиофил -> библиофилкиня
			['уй', 0]  //буй -> буйкиня
		],
	'есса' : [
			['[аеёов]р', 0],
			['[её]т', 2], //авторитет -> авторитесса
			['[лн]ь', 1], //создатель -> создателесса, камень -> каменесса
			['[оиы]к', 0], //язык -> языкесса
			['[оэ]т', 0], //гот -> готесса, поэт -> поэтесса
			['а[вчнб]', 0], //врач -> врачесса, баран -> баранесса, краб -> крабесса, состав -> составесса
			['во', 1], //существо -> существесса
			['е[кнц]', 0], //член -> членесса, канадец -> канадесса, человек -> человекесса
			['и[лр]', 0], //библиофил -> библиофилесса, командир -> командиресса
			['[лр]о', 1], //тело -> телесса, ведро -> ведресса
			['о[ндгп]', 0], //метод -> методесса, адрон -> адронесса, биолог -> биологесса, клоп -> клопесса
			['р[гк]', 0], //кварк -> кваркесса
			['ст', 0], //специалист -> специалистесса
			['у[дпнхт]', 0],  //сосуд -> сосудесса, колдун -> колдунесса, олух -> олухесса
			['уй', 1], //буй -> буесса
			['ще', 0], //вместилище -> вместилищесса
			['ый', 2], //учёный -> учёнесса
			['яд', 0]  //взгляд -> взглядесса
		],
	'ица'  : [
			['[аеёов]р', 0],
			['[её]т', 2], //авторитет -> авторитица
			['а[вбнсч]', 0], //врач -> врачица, краб -> крабица, состав -> составица
			['во', 1], //существо -> существица
			['ен', 0], //член -> членица
			['ец', 2], //канадец -> канадица
			['ик', 2],
			['и[влр]', 0], //библиофил -> библиофилица, командир -> командирица
			['нь', 1], //камень -> каменица
			['о[гд]', 0], //биолог -> биологиня, метод -> методица
			['рг', 0],
			['ст', 3], //специалист -> специалица
			['сс', 0], //процесс -> процессица
			['у[днпчт]', 0], //сосуд -> сосудица, колдун -> колдуница, труп -> трупица
			['уй', 1], //буй -> буица
			['ще', 3], //вместилище -> вместилищесса
			['яд', 0]  //взгляд -> взглядица
		],
	'ница' : [
			['ль', 0], //создатель -> создательница
			['ас', 0],
			['[её]т', 0], //авторитет -> авторитетица
			['ец', 2], //канадец -> канадница
			['уй', 0]  //буй -> буйница
		],
	'ая' : [
			['[ыио]й', 2], //учёный -> учёная, знающий -> знающая
			['ое', 2]
		],
	'ша'  : [
			['[её]т', 1], //вертолёт -> вертолёша
			['ут', 1], //лилипут -> лилипутша
			['ир', 0] //командир -> командирша
		],
	//----- ДАЛЬШЕ ИДЁТ ШИЗА -----
	'ии' : [
			['и[ия]', 2], //металлургии -> металлург_ии, произведения -> произведении
		],
	'ца' : [
			['ие', 1], //металлургии -> металлург_ии, произведения -> произведении
		],
	'ми' : [
			['ми', 2]  //знаниями -> знания_ми
		],
	'ой' : [
			['го', 3]  //художественного -> художественн_ой
		],
	'инь' : [
			['ей', 2]  //людей -> люд_ей
		],
	'ти' : [
			['ти', 2]  //области -> облас_ти
		],
	'ю' : [
			['ью', 1]  //матерью -> матерь_ю
		],
	'ны' : [
			['на', 2] //бассейна -> бассей_ны
		],
	'на' : [
			['но', 2] //способно -> способна
		],
	'ки' : [
			['ца', 2] //самца -> самки
		],
	'аяся' : [
			['ся', 4], //занимающийся -> занимающ_аяся
		],
};

//Слова со специфичными определениями
FEM.exceptions = {
	'феминист' : [ ['профеминист', 'союзник'],
			"Мифическое создание, якобы поддерживающее феминизм. В реальности не встречается."
	],
	'жена' : [ ['мужерабка', 'подстилка патриархата'],
			"Женщина, прогнувшаяся под патриархат и получающая удовольствие от угнетения."
	]
};

//Проверка на исключение
FEM.exceptions.contains = function(word) {
	return Object.keys(this).includes(word);
};

//Список значений
FEM.exceptions.feminitives  = function(word) {
	return [random_word(this[word][0]), this[word][0]];
};

//Дефиниция слова-исключения
FEM.exceptions.definition  = function(word) {
	return this[word][1];
};

//Слова для замены
FEM.words = {
	'то'      : 'т_а',
	'тот'     : 'т_а',
	'того'    : 'т_у',
	'кто'     : 'котор_ая',
	'её'      : 'е_ё',
	'ее'      : 'е_е',
	'ий'      : 'ая',
	'человек' : 'человека',
	'муж'     : 'жен'
};

FEM.words.convert = function(string) {
	for (var fem_w in this) {
		string =  string.replace(new RegExp('(^|\\s)+' + fem_w, "ig"), '$1' + this[fem_w])
				.replace(/(.)/, s => s.toUpperCase());
	}
	return string;
};

//------------------------------------------------------------------------------

//Первый элемент списка - окончание (в виде регулярного выражения)
let ending = tuple => new RegExp("^.*" + tuple[0] + "$", "i");

//Второй элемент списка - смещение
let offset = tuple => tuple[1];

//Случайный элемент списка
let random_word = wordlist => wordlist[Math.floor(Math.random() * wordlist.length)];

//Оборачивание в <span> с указанным классом
let html_wrap = (str, cl) => `<span class="${cl}">${str}</span>`;

//Цветовое выделение текста
let css_end = ending => html_wrap(ending, "ending");

//Символ gender gap
let css_gender_gap = html_wrap(' \u26A7 ', "queer");

//------------------------------------------------------------------------------

//Конструирование феминитива с gender_gap
function construct_feminitive(stem, ending, gap) {
	return gap ? stem + css_gender_gap + css_end(ending) : stem + "_" + ending;
}

//Отправка адреса страницы в vk.com
function share_page() {
	let vk_url = "http://vk.com/share.php"
			+ "?url="         + URL.href
			+ "&title="       + URL.title
			+ "&description=" + URL.description.text;

	let new_tab = window.open(vk_url,'_blank');
	new_tab.focus();
}

//Сохранение изображения с феминитивом
function download_image() {
	html2canvas(HTML.image(), {
		onrendered: canvas => {
			let a = document.createElement('a');
			a.href = canvas.toDataURL();
			a.download = HTML.content().innerHTML + '.png';
			a.click();
		}
	});
}

//Создание феминитива
function make_feminitives(word) {
	//Обрабатываем только слова длиннее трёх символов
	if (word.length < 3) return [word, word];

	var stem           = "";             //Основа слова
	var current_ending = word.slice(-2); //Текущее окончание
	var feminitives    = [];             //Массив феминитивов
	var femicards      = [];             //Массив феминитивов для карточки

	for (let fem_ending in FEM.endings) {
		FEM.endings[fem_ending].forEach(end => {
			if (ending(end).test(current_ending)) {
				//Удаление лишних букв из основы
				stem = offset(end) === 0 ? word : word.slice(0, -offset(end));

				//Добавление фем-варианта слова в массив
				feminitives.push(construct_feminitive(stem, fem_ending, 1));
				femicards.push(construct_feminitive(stem, fem_ending, 0));
			}
		});
	}
	//При отсутствии феминитивов считать корректным исходное слово
	return [random_word(femicards) || word, feminitives];
}

//Поиск и феминизация дефиниции в викистранице
function parseWikiPage(page) {
	var wiki = page.split('\n');
	var definition = "";

	wiki.some((line, n) => {
		if (line.match(/^.*==== Значение ====.*$/)) {
			console.log(wiki[n+1]); //DEBUG
			definition = wiki[n+1]
			.replace(/^# ?/, "")                          //# дефиниция
			.replace(/\[{2}([^\]\|]*)\]{2}/g, "$1")       //[[1]]
			.replace(/\[{2}[^\|]*\|([^\]]*)\]{2}/g, "$1") //[[1|2]]
			.replace(/\[{2}([^\]\|]*)\}{2}/g, "$1")       //{{1}}
			.replace(/\{{2}[^\{\}]*\}{2} ?/g, "")         //{{1|2}}
			.replace(/\{{2}[^\{\}]*\|.*/g, "")            //{{1|слово<!--комментарий-->.*$
			.replace(/\{{2}[^\{\}]*\}{2} ?/g, "")         //~ : возможна вложенность
			.replace(/\[[0-9]{1,}\]/g, "")                //ссылки [n]
			.replace(/^ *, */g, "")                       //^, ...
			.replace(/ ?$/,".");                          //Точка в конце предложения
			return true;
		}
	});

	//Разделение дефиниции на массив слов и знаков препинания и феминизация слов
	var tokens =  definition.match(/[\wа-яА-Яё]+|\d+| +|[.;,]|[^ \w\d\t.;,]+/ig) || [];
	console.log(tokens);

	//Замена местоимений, предлогов и проч.
	HTML.full().innerHTML = FEM.words.convert(tokens.map(w => make_feminitives(w)[0]).join(""));

	//DEBUG
	console.log(definition);
	console.log(tokens);
}

//Запрос значения слова в викисловаре
function get_wiktionary(term) {
	var cors_url = "https://coors.now.sh/";
	var wiki_url = cors_url + "https://ru.wiktionary.org/w/index.php?action=raw&title=" + term;

	var xmlhttp = window.XMLHttpRequest
		? new XMLHttpRequest()
		: new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			parseWikiPage(xmlhttp.responseText);
		}
	};

	xmlhttp.open("GET", wiki_url, true);
	xmlhttp.send();
}

//Создание и вывод феминитива
function tr(word) {
	//Исходное слово
	var wd = word || HTML.input().value.trim().toLowerCase().replace(/<\/?[^>]+(>|$)/g, "").split(" ")[0];
	var feminitives = "";

	//Состояние по умолчанию
	HTML.content().innerHTML = "Введите слово";
	HTML.dict().innerHTML    = "";
	HTML.full().innerHTML    = "";

	HTML.vis(HTML.help(),    "hidden");
	HTML.vis(HTML.content(), "visible");

	//Изменение адреса
	URL.set(wd);

	//Вывод информации
	if (!wd) {
		show_help();

		return;
	} else if (FEM.exceptions.contains(wd)) {
		HTML.full().innerHTML = FEM.exceptions.definition(wd);
		feminitives = FEM.exceptions.feminitives(wd);
	} else {
		get_wiktionary(wd);
		feminitives = make_feminitives(wd);
	}
	//Вывод информации
	HTML.input().value = wd;
	HTML.content().innerHTML = feminitives[0].replace(/(.)/, s => s.toUpperCase());
	HTML.dict().innerHTML    = feminitives[1].join(" | ")
				|| "Это слово и так прекрасно. Оставим его как есть.";
}

//------------------------------------------------------------------------------

//Параметры URL
var URL = {
	opt: {},
	description: {
		clear: function()   { this.text = "Как феминистки пишут разные слова."; },
		set:   function(wd) { this.text = 'Как феминистки пишут слово "' +wd+ '".'; },
	},
	set: function(wd) {
		if (!wd) {
			window.history.pushState({}, null, window.location.href.split('?')[0]);
			this.description.clear();
		} else {
			window.history.pushState({}, null, window.location.href.split('?')[0]+'?word='+wd);
			this.description.set(wd);
		}
		this.href = encodeURIComponent(window.location.href);
	}
};

//Разбор параметров URL
URL.parse = function() {
	var gy = window.location.search.substring(1).split("&");
	gy.forEach(arg => {
		let ft = arg.split("=");
		this.opt[ft[0]] = this.opt[ft[0]] || decodeURIComponent(ft[1]);
	});

	URL.description.clear();
	this.title = document.title;
	this.opt.href  = encodeURIComponent(window.location.href);
};

//Инициализация с разбором адресной строки
function init(container) {
	HTML.init(container);
	URL.parse();

	if (URL.opt.word) {
		HTML.input().value = URL.opt.word.replace(/\+/g," ");
		tr();
	} else {
		show_help();
	}
}
