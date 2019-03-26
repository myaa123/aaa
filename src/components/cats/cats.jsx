const React = require('react');
const bindAll = require('lodash.bindall');

const Modal = require('../modal/base/modal.jsx');

require('./cats.scss');

const catImages = [
    '/images/cats/IMG_9798.jpg',
    '/images/cats/IMG_9775.jpg',
    '/images/cats/IMG_9766.jpg',
    '/images/cats/IMG_9587.jpg',
    '/images/cats/IMG_6558.jpg',
    '/images/cats/IMG_6521.jpg',
    '/images/cats/IMG_6020.jpg',
    '/images/cats/IMG_5880.jpg',
    '/images/cats/IMG_3218.jpg',
    '/images/cats/IMG_2776.jpg',
    '/images/cats/IMG_2775.jpg',
    '/images/cats/IMG_2681.jpg',
    '/images/cats/IMG_1092.jpg',
    '/images/cats/IMG_0684.jpg',
    '/images/cats/IMG_0698.jpg',
    '/images/cats/IMG_0504.jpg',
    '/images/cats/IMG_0288.jpg',
    '/images/cats/IMG_0122.jpg',
    '/images/cats/IMG_2507.jpg',
    '/images/cats/IMG_1977.jpg',
    '/images/cats/IMG_1696.jpg',
    '/images/cats/IMG_1463.jpg',
    '/images/cats/IMG_1157.jpg',
    '/images/cats/IMG_0681.jpg',
    '/images/cats/IMG_0135.jpg',
    '/images/cats/IMG_0071.jpg'
];

const catFacts = [
    'Cats don\'t have 9 lives, but they DO have 9 toes.',
    'All cats are turquoise for a few minutes after they\'re born.',
    'Cats born in the UK prefer tea over water.',
    'The following fact about cats is not fact.',
    'This sentence about cats is false.',
    'Cats aren\'t actually turquoise when they\'re born.',
    'More cats have been to the moon than I have. ',
    'Cats are descended from an ancient alien race from the vicinity of Betelgeuse.',
    'Cats are not not dogs.',
    'The cat Tom, from Tom and Jerry is actually my alter-ego.',
    'If a cat winks twice in a row it means they like to wink.',
    'Cats enjoy playing fetch even more than dogs.',
    'The internet was created as a way to better share images of cats with loved ones.',
    'Cats developed tails as a way to get out of doing homework.',
    'Cats train for marathons by sprinting through your house at very early hours of the morning. ',
    'Cats read newspapers when no one is looking and they can tell if a camera is on in the room.',
    'The word "cat" means "sneezing while cold" in 17 languages. ',
    'Cats are not not adorable.',
    'Cat is the longest word you can type on the keyboard with only one hand.',
    'Meow meow mrow. Meow!',
    'What even is a cat?',
    'The song "Row, Row, Row your boat" is about the authors pet cat.',
    'Cat\'s really like listening to music, but only if it is meowsic.',
    'No.',
    'The first cat was born in 1993.',
    'The Great Catsby is often considered a favorite among cats.',
    'When you\'re not home cats will often try on your shoes.',
    'Cats are actually born in kangaroo pouches.',
    'My friends cat has so many toes.',
    'The greatest writer of all time is a cat known as William Shakespurrrr.',
    'When a cat looks in a mirror it sees purrrrfection.',
    'What\'s a cats favorite movie? Pitch Purrrrfect.',
    'It\'s common knowledge that J.K. Meowling is the real author of the Hairy Potter series.',
    'If my cat went to Hogwarts it would be in Ravenpaw.',
    'Kitty McPurrs-a-lot would make an excellent name for a cat.',
    'Cats blame mice for everything.',
    'Boots & cats & boots & cats & boots & cats & boots & cats.',
    // eslint-disable-next-line max-len
    'When a cat is happy sometimes you can hear the soft whirr of its storage system recording the experience for an upcoming show & tell presentation.',
    'Some people think cats are aloof but actually they just really respect your independence.',
    'Modern cats evolved from a creature that looked exactly like Scratch Cat, but more orange.',
    'The reason there are so many cats on the Internet is that all the servers run on hamster wheels.',
    'The word "cat" spelled backwards is taco. Wait, no... burrito? Something like that.',
    'Cats like to attack twist ties, bottle caps, and other reminders of their lack of thumbs.',
    'Kittens were invented by scientists developing a standard measuring system for "cute."',
    'Due to the difference between metric units and other systems, 1 "mew" is about 1.6 "mrow" units.',
    'Cats sometimes knock things off shelves and tables in order to make those items safe from falling.',
    'A cat\'s tail is usually its second- or third-best friend.'
];


class Cats extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleCatsClick',
            'handleClose',
            'pickRandomFact'
        ]);
        this.state = {
            open: false
        };
    }

    handleCatsClick () {
        this.setState({open: true});
    }

    handleClose () {
        this.setState({open: false});
    }

    pickRandomFact () {
        const randomNumber = Math.floor(Math.random() * (catFacts.length - 1));
        const catFact = catFacts[randomNumber];
        return catFact;
    }

    pickRandomCatImage () {
        const randomNumber = Math.floor(Math.random() * (catImages.length - 1));
        const catImage = catImages[randomNumber];
        return catImage;
    }

    render () {
        return (<React.Fragment>
            <div onClick={this.handleCatsClick}>
                <a> {'Cats...?'} </a>
            </div>
            <Modal
                useStandardSizes
                className="mod-cats"
                isOpen={this.state.open}
                onRequestClose={this.handleClose}
            >
                <div className="cats-modal-header modal-header">
                    <div className="cats-content-label content-label">
                        {'Did you know...?'}
                    </div>
                </div>
                <div className="cats-modal-content modal-content">
                    <p> {this.pickRandomFact()} </p>
                    <img src={this.pickRandomCatImage()} />
                </div>
            </Modal>
        </React.Fragment>
        );

    }
}

module.exports = Cats;
