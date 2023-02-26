//	Imports ____________________________________________________________________

import type { DiffFavoriteMessage, FavoritesCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ leftVM, rightVM }: FavoritesCommandsInit) {
	
	msg.on('l13Diff.action.panel.addToFavorites', () => {
		
		msg.send<DiffFavoriteMessage>('save:favorite', {
			pathA: leftVM.value,
			pathB: rightVM.value,
		});
		
	});
	
}

//	Functions __________________________________________________________________

