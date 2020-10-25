//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________

const findLanguageClassName = /^language\-/;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export let language = 'en';

export function detectLanguage () {
	
	const body = document.body;
	
	body.classList.forEach((classname) => {
		
		if (findLanguageClassName.test(classname)) language = classname.replace(findLanguageClassName, '');
		
	});
	
}

//	Functions __________________________________________________________________

