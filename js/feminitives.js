// [ ] TODO: сохранение изображения
// [ ] TODO: разбор переданного адреса
// [ ] TODO: vk.com
// [ ] TODO: валидация
// [ ] TODO: jQuery (?)

//Подготовка запросов к cors.how.sh
$.ajaxPrefilter(function (options) {
  if (options.crossDomain && jQuery.support.cors) {
    var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
    options.url = http + '//cors.now.sh/' + options.url;
  }
});

var FEM = {};

//Правила создания феминитивов
FEM.endings = {
	'ка'   : [
			['[аео]р', 0],
			['ан', 0],
			['рг', 1],
			['ст', 0], //специалист -> специалистка
			['ец', 2]  //канадец -> канадка
		],
	'иня'  : [
			['[аео]р', 0],
			['[ои]к', 0],
			['ог', 0], //биолог -> биологиня
			['рг', 0],
			['ач', 0], //врач -> врачиня
			['ст', 0], //специалист -> специалистиня
			['ец', 2]  //канадец -> канадиня
		],
	'киня' : [
			['[аео]р', 0],
			['ок', 0],
			['ст', 0], //специалист -> специалисткиня
			['ан', 0]
		],
	'есса' : [
			['[аео]р', 0],
			['[ои]к', 0],
			['ог', 0], //биолог -> биологиня
			['ан', 0],
			['рг', 0],
			['ач', 0], //врач -> врачесса
			['ый', 2], //учёный -> учёнесса
			['ст', 0], //специалист -> специалистесса
			['ец', 2]  //канадец -> канадесса
		],
	'ица'  : [
			['[аео]р', 0],
			['уч', 0],
			['ик', 2],
			['ог', 0], //биолог -> биологиня
			['ан', 0],
			['ив', 0],
			['рг', 0],
			['ач', 0], //врач -> врачица
			['ст', 2], //специалист -> специалица
			['ец', 2]  //канадец -> канадица
		],
	'ница' : [
			['ль', 0],
			['ец', 2]  //канадец -> канадница
		],
	'ая' : [
			['[ыи]й', 2], //учёный -> учёная, знающий -> знающая
		],
	//----- ДАЛЬШЕ ИДЁТ ШИЗА -----
	'ии' : [
			['и[ия]', 2], //металлургии -> металлург_ии, произведения -> произведении
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
			['ью', 2]  //матерью -> матерь_ю
		],
};

//Слова для замены
FEM.words = {
	'тот'  : 'т_а',
	'того' : 'т_у',
	'кто'  : 'котор_ая',
	'её'   : 'е_ё',
	'ее'   : 'е_е',
	'ий'   : 'ая'
};

FEM.words.convert = function(string) {
	for (var fem_w in this) {
		string =  string.replace(new RegExp(fem_w, "ig"), this[fem_w])
				.replace(/(.)/, s => s.toUpperCase());
	}
	return string;
}

//Первый элемент списка - окончание (в виде регулярного выражения)
function ending(tuple) {
	return new RegExp("^.*" + tuple[0] + "$", "i");
}

//Второй элемент списка - смещение
function offset(tuple) {
	return tuple[1];
}

//Случайный элемент списка
function random_word(wordlist) {
	return wordlist[Math.floor(Math.random() * wordlist.length)];
}

//Оборачивание в <span> с указанным классом
function html_wrap(str, cl) {
	return "<span class=\"" + cl + "\">" + str + "</span>";
}

//Цветовое выделение текста
function css_end(ending)  { return html_wrap(ending, "text-warning");  }

//Символ gender gap
function css_gender_gap() { return html_wrap(' \u26A7 ', "queer"); }

//Конструирование феминитива с gender_gap
function construct_feminitive(stem, ending, gap) {
	if (gap) {
		return stem + css_gender_gap() + css_end(ending);
	} else {
		return stem + "_" + ending;
	}
}

//Создание феминитива
function make_feminitives(word) {
	var stem           = "";           //Основа слова
	var current_ending = word.slice(-2); //Текущее окончание
	var feminitives    = new Array();  //Массив феминитивов
	var femicards      = new Array();  //Массив феминитивов для карточки

	for (var fem_ending in FEM.endings) {
		FEM.endings[fem_ending].forEach(function(end) {
			if (ending(end).test(current_ending)) {
				//Удаление лишних букв из основы
				stem = offset(end) == 0 ? word : word.slice(0, -offset(end));

				//Добавление фем-варианта слова в массив
				feminitives.push(construct_feminitive(stem, fem_ending, 1));
				femicards.push(construct_feminitive(stem, fem_ending, 0));
			}
		});
	};
	//При отсутствии феминитивов считать корректным исходное слово
	if (feminitives.length === 0) {
		femicards.push(word);
	};

	var femicard = random_word(femicards);

	return [femicard, feminitives];
}

//Запрос значения слова в викисловаре
function get_wiktionary(term, ui) {
	var wiki_url = "https://ru.wiktionary.org/w/index.php?title=" + term + "&action=raw";

	return $.get(wiki_url, function (data) {
		var wiki       = data.split("\\n");
		var definition = "";

		for(var line = 0; line < wiki.length; line++){
			if (wiki[line].match(/^.*==== Значение ====.*$/)) {
				console.log(wiki[line+1]); //DEBUG
				definition = wiki[line+1]
				.replace(/^# ?/, "")                         //# дефиниция
				.replace(/\[{2}([^\]\|]*)\]{2}/g, "$1")      //[[1]]
				.replace(/\[{2}[^\|]*\|([^\]]*)\]{2}/, "$1") //[[1|2]]
				.replace(/\[{2}([^\]\|]*)\}{2}/g, "$1")      //{{1}}
				.replace(/\{{2}[^\{\}]*\}{2} ?/g, "")        //{{1|2}}
				.replace(/\{{2}[^\{\}]*\}{2} ?/g, "")        //~ : возможна вложенность
				.replace(/\[[0-9]{1,}\]/g, "")               //ссылки [n]
				.replace(/ ?$/,".")                          //Точка в конце предложения
				break;
			}
		}

		var w = "";
		var ww = new Array();
		for (var l = 0; l <= definition.length; l++) {
			if (/[^\wа-яА-Я]/.test(definition[l])) {
				ww.push(w);
				ww.push(definition[l]);
				w = "";
				continue;
			} else {
				w += definition[l];
			}
		}

		var dd = new Array();
		ww.forEach(function(word) {
			if (word.length > 2) {
				dd.push(make_feminitives(word)[0]);
			} else {
				dd.push(word);
			}
		});

		//DEBUG
		console.log(ww.join(""));
		console.log(dd);

		//Замена местоимений, предлогов и проч.
		var article = FEM.words.convert(dd.join(""));
		console.log(article);

		$("#" + ui).html(article);
	});
}

//Создание и вывод феминитива
function tr(word, descr) {
	//Исходное слово
	var wd = $("#" + word).val().trim().split(" ")[0];

	//Вывод дефиниции
	get_wiktionary(wd, descr + "-full");

	$("#" + descr).empty();

	var feminitives = make_feminitives(wd);

	//Вывод информации
	$("#" + descr).html(feminitives[1].join(" | "));
	$("#" + descr + "-content").html(feminitives[0]);
}

