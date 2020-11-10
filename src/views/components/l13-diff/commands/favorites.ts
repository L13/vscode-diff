//	Imports ____________________________________________________________________

import { DiffFavoriteMessage } from '../../../../types';

import { msg } from '../../common';

import { L13DiffInputViewModel } from '../../l13-diff-input/l13-diff-input.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (leftVM:L13DiffInputViewModel, rightVM:L13DiffInputViewModel) {
	
	msg.on('l13Diff.action.addToFavorites', () => {
		
		msg.send<DiffFavoriteMessage>('save:favorite', {
			pathA: leftVM.value,
			pathB: rightVM.value,
		});
		
	});
	
}

//	Functions __________________________________________________________________

