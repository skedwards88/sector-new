import {gameInit} from "./gameInit.js";

export function gameReducer(currentGameState, payload) {
  if (payload.action === "newGame") {

    return gameInit({
      ...currentGameState,
      ...payload,
      useSaved: false,
    });
  } else if (payload.action === "rotate") {
    let oldOverlay = currentGameState.overlay;
    let newOverlay = [
      oldOverlay[2],
      oldOverlay[0],
      oldOverlay[3],
      oldOverlay[1],
    ]
    return {
      ...currentGameState,
      overlay: newOverlay,
    }
  } else if (payload.action === "dragStart") {
    // Store the quadrant that the player is dragging
    // in the game state instead of in the event data
    // so that we can access the data from the dragEnter event
    return {
      ...currentGameState,
      draggedOverlayIndex: payload.draggedOverlayIndex,
    }
  } else if (payload.action === "drop" || payload.action === "dragEnter") {
    // Drop/move a piece on the overlay, but don't update the played pieces yet (that is taken care of by the 'end turn' action)

    // Convert the index where the overlay was dropped to a row/column
    const dropIndex = payload.dropIndex;
    const dropRow = Math.floor(dropIndex / currentGameState.expanseSize);
    const dropColumn = dropIndex - dropRow * currentGameState.expanseSize;

    // Convert the overlay quadrant index that the user dragged t oa row/column
    const overlayIndex = currentGameState.draggedOverlayIndex
    const overlayRow = Math.floor(overlayIndex / (currentGameState.overlay.length / 2));
    const overlayColumn = overlayIndex - overlayRow * (currentGameState.overlay.length / 2);

    // Adjust the index where the overlay was dropped
    // to reflect the index where the top left of the overlay ended up
    // but don't let the overlay go off the board
    const adjustedDropRow = Math.min(Math.max(0, dropRow - overlayRow), currentGameState.expanseSize - 2)
    const adjustedDropColumn = Math.min(Math.max(0, dropColumn - overlayColumn), currentGameState.expanseSize - 2)

    // Convert the row/column back to the index where the top left of the overlay ended up
    const newOverlayTopLeft = adjustedDropColumn + (currentGameState.expanseSize * adjustedDropRow);

    return {
      ...currentGameState,
      overlayTopLeft: newOverlayTopLeft,
    };
  } else if (payload.action === "endTurn") {
    let newPlayed = JSON.parse(JSON.stringify(currentGameState.played));
    const overlay = currentGameState.overlay;

    for (let overlayIndex = 0; overlayIndex < overlay.length; overlayIndex++) {
      const adjustedIndex =
        overlayIndex < 2
          ? currentGameState.overlayTopLeft + overlayIndex
          : currentGameState.overlayTopLeft + currentGameState.expanseSize + overlayIndex - 2;
          newPlayed[adjustedIndex].color = overlay[overlayIndex].color
          newPlayed[adjustedIndex].shape = overlay[overlayIndex].shape
    }

    let newDeck = JSON.parse(JSON.stringify(currentGameState.deck));
    const newOverlay = newDeck.pop();
    return {
      ...currentGameState,
      deck: newDeck,
      overlay: newOverlay,
      draggedOverlayIndex: undefined,
      overlayTopLeft: undefined,
      played: newPlayed,
      isBlueTurn : !currentGameState.isBlueTurn,
    }
  } else {
    console.error(`unhandled action: ${payload.action}`);
    return {...currentGameState};
  }
}