'use strict';

/*
* This manages the connections to a client, who is hosting a lobby.
* All traffic routes thru the lobby host, for all games running in the lobby.
*
* */

import {createOffering} from "../../js/webRTC/webRtcConnection.js";

export class GameNetwork {
  constructor(isHost) {
    this.isHost = true;
    this.offering = null;
    this.answering = null;
    this.offeringCbs = [];

    if (this.isHost) createOffering().then(offering => {
      this.offering = offering;

    });
  }

  getOfferingDescription() {
    if (!this.offering) {
      throw new Error('Offering not available');
    } else {
      return this.offering.peerConnection.localDescription;
    }
  }

  onOffering(fn) {

  }

  handleOfferCbs() {
    for (const argument of this.offeringCbs) {

    }
  }

}

export function createHost() {

}
