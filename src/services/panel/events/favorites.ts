//	Imports ____________________________________________________________________

import type { DiffFavoriteMessage } from '../../../types';

import { FavoritesDialog } from '../../dialogs/FavoritesDialog';

import { FavoritesState } from '../../states/FavoritesState';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	const favoritesState = FavoritesState.create(currentDiffPanel.context);
	const favoritesDialog = FavoritesDialog.create(favoritesState);
	
	currentDiffPanel.msg.on('save:favorite', (data: DiffFavoriteMessage) => {
		
		favoritesDialog.add(data.pathA, data.pathB);
		
	});
	
}

//	Functions __________________________________________________________________

