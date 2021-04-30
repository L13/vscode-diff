//	Imports ____________________________________________________________________

const fs = require('fs');
const path = require('path');

//	Variables __________________________________________________________________

process.chdir(path.dirname(path.dirname(__dirname)));

const findSlash = /\//;
const findTypeScriptRule = /^@typescript\-eslint\//;

const mapESLintToTSLint = {
	camelcase: 'naming-convention',
};

// const mapTSLintToESLint = {
// 	'naming-convention': 'camelcase',
// };

const eslintRecommendedRules = require('eslint/conf/eslint-recommended').rules;
const eslintRecommendedDisabledRules = require('@typescript-eslint/eslint-plugin/dist/configs/eslint-recommended').overrides[0].rules;
const tslintRecommendedRules = require('@typescript-eslint/eslint-plugin/dist/configs/recommended').rules;
const tslintRecommendedTypeCheckingRules = require('@typescript-eslint/eslint-plugin/dist/configs/recommended-requiring-type-checking').rules;

const localRules = JSON.parse(fs.readFileSync('.eslintrc.json', 'utf-8')).rules;

const allESLintRules = getAllRules('node_modules/eslint/lib/rules');
const allTSLintRules = getAllRules('node_modules/@typescript-eslint/eslint-plugin/dist/rules');
const commonESLintRules = allESLintRules.filter((rule) => allTSLintRules.includes(mapESLintToTSLint[rule] || rule));

const allRecommendedRules = {
	...eslintRecommendedRules,
	...eslintRecommendedDisabledRules,
	...tslintRecommendedRules,
	...tslintRecommendedTypeCheckingRules,
};
const allRules = { ...allRecommendedRules, ...localRules};

//	Initialize _________________________________________________________________

for (const rule in allRecommendedRules) {
	if (rule in localRules) {
		if (allRecommendedRules[rule] === localRules[rule]) {
			console.log(`Rule "${rule}" has same value "${allRecommendedRules[rule]}" as recommended`);
		}
	}
}

for (const rule in localRules) {
	if (!findSlash.test(rule)) {
		if (!allESLintRules.includes(rule)) {
			console.log(`ESLint rule "${rule}" does not exist!`);
		}
	} else if (findTypeScriptRule.test(rule)) {
		const name = rule.replace(findTypeScriptRule, '');
		if (!allTSLintRules.includes(name)) {
			console.log(`TSLint rule "${rule}" does not exist!`);
		}
	}
}

commonESLintRules.forEach((rule) => {
	
	const tsRule = `@typescript-eslint/${mapESLintToTSLint[rule] || rule}`;
	
	if (rule in allRules && !(tsRule in allRules)) {
		console.log(`Missing typescript rule "${tsRule}"`);
	}
	
	if (rule in allRules && tsRule in allRules && allRules[rule] !== 'off') {
		console.log(`Wrong javascript rule "${rule}": "${allRules[rule]}"`);
	}
	
	if (!(rule in allRules) && tsRule in allRules) {
		if (allRules[tsRule] === 'off') {
			console.log(`Typescript rule "${tsRule}" not required because value is "off"`);
		} else console.log(`Missing javascript rule "${rule}"`);
	}
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

function getAllRules (dirname) {
	
	const once = {};
	
	return fs.readdirSync(dirname).filter((name) => {
		
		return fs.lstatSync(path.join(dirname, name)).isFile();
		
	}).map((name) => {
		
		while (path.extname(name)) name = path.basename(name, path.extname(name));
		
		return name;
		
	}).filter((name) => name in once ? false : once[name] = true);
	
}