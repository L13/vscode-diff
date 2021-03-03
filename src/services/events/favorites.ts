//	Imports ____________________________________________________________________

import { DiffFavoriteMessage } from '../../types';

import { DiffPanel } from '../panel/DiffPanel';

import { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel:DiffPanel) {
	
	const favoritesState = FavoritesState.createFavoritesState(currentDiffPanel.context);
	
	currentDiffPanel.msg.on('save:favorite', (data:DiffFavoriteMessage) => {
		
		favoritesState.addFavorite(data.pathA, data.pathB);
		
	});
	
}

//	Functions __________________________________________________________________

