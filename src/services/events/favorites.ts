//	Imports ____________________________________________________________________

import { DiffFavoriteMessage } from '../../types';

import { DiffPanel } from '../panel/DiffPanel';
import { DiffFavorites } from '../sidebar/DiffFavorites';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel:DiffPanel) {
	
	currentDiffPanel.msg.on('save:favorite', (data:DiffFavoriteMessage) => DiffFavorites.addFavorite(currentDiffPanel.context, data.pathA, data.pathB));
	
}

//	Functions __________________________________________________________________

