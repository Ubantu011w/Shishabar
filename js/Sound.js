import { Howl, Howler } from 'howler'

import bloop from '../sounds/bloop.mp3'
import click from '../sounds/click.mp3'
import whoosh from '../sounds/whoosh.mp3'
import punch from '../sounds/punch.wav'
import appear from '../sounds/appear.mp3'
import vanish from '../sounds/vanish.mp3'


export class Sound
{
    constructor()
    {

        this.bloop = new Howl({
            src: [bloop],
            volume: 0.3
        });

        this.click = new Howl({
            src: [click],
            volume: 0.3
        });
        
        this.whoosh = new Howl({
            src: [whoosh],
            volume: 0.6
        });

        this.punch = new Howl({
            src: [punch],
            volume: 0.6
        });

        this.appear = new Howl({
            src: [appear],
            volume: 0.6
        });

        this.vanish = new Howl({
            src: [vanish],
            volume: 0.6
        });

        //this.setMute()
    }

    // setMute()
    // {
    //     // Set up
    //     this.muted = typeof this.debug !== 'undefined'
    //     Howler.mute(this.muted)

    //     // M Key
    //     window.addEventListener('keydown', (_event) =>
    //     {
    //         if(_event.key === 'm')
    //         {
    //             this.muted = !this.muted
    //             Howler.mute(this.muted)
    //         }
    //     })

    //     // Tab focus / blur
    //     document.addEventListener('visibilitychange', () =>
    //     {
    //         if(document.hidden)
    //         {
    //             Howler.mute(true)
    //         }
    //         else
    //         {
    //             Howler.mute(this.muted)
    //         }
    //     })

    //     // Debug
    //     if(this.debug)
    //     {
    //         this.debugFolder.add(this, 'muted').listen().onChange(() =>
    //         {
    //             Howler.mute(this.muted)
    //         })
    //     }
    // }


    playBloop() {
        this.bloop.play()
    }

    playClick() {
        this.click.play()
    }

    playWhoosh() {
        this.whoosh.play()
    }

    playPunch() {
        this.punch.play();
    }

    playAppear() {
        this.appear.play();
    }

    playVanish() {
        this.vanish.play();
    }

}