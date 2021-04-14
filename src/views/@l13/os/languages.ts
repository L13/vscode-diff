//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________

// eslint-disable-next-line no-useless-escape
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

