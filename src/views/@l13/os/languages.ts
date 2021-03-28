//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________

const findLanguageClassName = /^language\-/;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export let language = 'en';

export function detectLanguage () {
	
	document.body.classList.forEach((classname) => {
		
		if (findLanguageClassName.test(classname)) language = classname.replace(findLanguageClassName, '');
		
	});
	
}

//	Functions __________________________________________________________________

