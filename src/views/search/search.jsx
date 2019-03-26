const bindAll = require('lodash.bindall');
const connect = require('react-redux').connect;
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;
const PropTypes = require('prop-types');
const React = require('react');

const api = require('../../lib/api');
const Button = require('../../components/forms/button.jsx');
const Form = require('../../components/forms/form.jsx');
const Grid = require('../../components/grid/grid.jsx');
const navigationActions = require('../../redux/navigation.js');
const Select = require('../../components/forms/select.jsx');
const TitleBanner = require('../../components/title-banner/title-banner.jsx');
const Tabs = require('../../components/tabs/tabs.jsx');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

const ACCEPTABLE_MODES = ['trending', 'popular'];

const results = require('./results.json');

const tone = require('tone');

require('./search.scss');

class Search extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getSearchState',
            'handleChangeSortMode',
            'handleGetSearchMore',
            'handlePianoHover',
            'getTab'
        ]);
        this.state = this.getSearchState();
        this.state.loaded = results;
        this.state.loadNumber = 16;
        this.state.mode = 'popular';
        this.state.offset = 0;
        this.state.loadMore = false;

        this.state.isEgg = false;
        this.state.isPiano = false;
        this.state.isTutorial = false;

        let mode = '';
        const query = window.location.search;
        const m = query.lastIndexOf('mode=');
        if (m !== -1) {
            mode = query.substring(m + 5, query.length).toLowerCase();
        }
        while (mode.indexOf('/') > -1) {
            mode = mode.substring(0, mode.indexOf('/'));
        }
        while (mode.indexOf('&') > -1) {
            mode = mode.substring(0, mode.indexOf('&'));
        }
        mode = decodeURIComponent(mode.split('+').join(' '));
        if (ACCEPTABLE_MODES.indexOf(mode) !== -1) {
            this.state.mode = mode;
        }

    }
    componentDidMount () {
        const query = decodeURIComponent(window.location.search);
        let term = query;

        const stripQueryValue = function (queryTerm) {
            const queryIndex = query.indexOf('q=');
            if (queryIndex !== -1) {
                queryTerm = query.substring(queryIndex + 2, query.length).toLowerCase();
            }
            return queryTerm;
        };
        // Strip off the initial "?q="
        term = stripQueryValue(term);
        // Strip off user entered "?q="
        term = stripQueryValue(term);

        while (term.indexOf('/') > -1) {
            term = term.substring(0, term.indexOf('/'));
        }
        while (term.indexOf('&') > -1) {
            term = term.substring(0, term.indexOf('&'));
        }
        try {
            term = decodeURIComponent(term);
        } catch (e) {
            // Error means that term was not URI encoded and decoding failed.
            // We can silence this error because not all query strings are intended to be decoded.
        }

        if (term === 'egg' || term === 'eggs') {
            this.makeSurprise('isEgg');
        }
        if (term === 'piano') {
            this.makeSurprise('isPiano');
        }
        if (term === 'silly tutorial') {
            this.makeSurprise('isTutorial');
        }

        this.props.dispatch(navigationActions.setSearchTerm(term));
    }
    componentDidUpdate (prevProps) {
        if (this.props.searchTerm !== prevProps.searchTerm) {
            this.handleGetSearchMore();
        }
    }
    makeSurprise (surprise) {
        this.setState({[surprise]: true});
    }
    playNote (noteNumber) {
        const synth = new tone.MonoSynth({
            oscillator: {
                type: 'square'
            },
            filter: {
                Q: 2,
                type: 'lowpass',
                rolloff: -12
            },
            envelope: {
                attack: 0.005,
                decay: 3,
                sustain: 0,
                release: 0.45
            },
            filterEnvelope: {
                attack: 0.5,
                decay: 0.32,
                sustain: 0.9,
                release: 3,
                baseFrequency: 700,
                octaves: 2.3
            }
        }).toMaster();
        const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
        // play a note with the synth we setup
        synth.triggerAttackRelease(notes[noteNumber % 12], '16n');
    }
    handlePianoHover (noteNumber) {
        this.playNote(noteNumber);
    }
    getSearchState () {
        let pathname = window.location.pathname.toLowerCase();
        if (pathname[pathname.length - 1] === '/') {
            pathname = pathname.substring(0, pathname.length - 1);
        }
        const start = pathname.lastIndexOf('/');
        const type = pathname.substring(start + 1, pathname.length);
        return {
            tab: type,
            loadNumber: 16
        };
    }
    handleChangeSortMode (name, value) {
        if (ACCEPTABLE_MODES.indexOf(value) !== -1) {
            const term = this.props.searchTerm.split(' ').join('+');
            window.location =
                `${window.location.origin}/search/${this.state.tab}?q=${term}&mode=${value}`;
        }
    }
    handleGetSearchMore () {
        let termText = '';
        if (this.props.searchTerm !== '') {
            termText = `&q=${encodeURIComponent(this.props.searchTerm.split(' ').join('+'))}`;
        }
        const locale = this.props.intl.locale;
        const loadNumber = this.state.loadNumber;
        const offset = this.state.offset;
        const mode = this.state.mode;
        const queryString = `limit=${loadNumber}&offset=${offset}&language=${locale}&mode=${mode}${termText}`;

        api({
            uri: `/search/${this.state.tab}?${queryString}`
        }, (err, body) => {
            const loadedSoFar = this.state.loaded;
            Array.prototype.push.apply(loadedSoFar, body);
            const currentOffset = this.state.offset + this.state.loadNumber;
            const willLoadMore = body.length === this.state.loadNumber;

            this.setState({
                loaded: loadedSoFar,
                offset: currentOffset,
                loadMore: willLoadMore
            });
        });
    }
    getTab (type) {
        const term = this.props.searchTerm.split(' ').join('+');
        let allTab = (
            <a href={`/search/${type}?q=${term}/`}>
                <li>
                    <img
                        className={`tab-icon ${type}`}
                        src={`/svgs/tabs/${type}-inactive.svg`}
                    />
                    <FormattedMessage id={`general.${type}`} />
                </li>
            </a>
        );
        if (this.state.tab === type) {
            allTab = (
                <a href={`/search/${type}?q=${term}/`}>
                    <li className="active">
                        <img
                            className={`tab-icon ${type}`}
                            src={`/svgs/tabs/${type}-active.svg`}
                        />
                        <FormattedMessage id={`general.${type}`} />
                    </li>
                </a>
            );
        }
        return allTab;
    }
    getProjectBox () {
        const results = (
            <Grid
                cards
                showAvatar
                isEggShaped={this.state.isEgg}
                itemType={this.state.tab}
                items={this.state.loaded}
                showFavorites={false}
                showLoves={false}
                showViews={false}
                onPianoEnter={this.state.isPiano ? this.handlePianoHover : null}
            />
        );
        let searchAction = null;
        if (this.state.loaded.length === 0 && this.state.offset !== 0) {
            searchAction = <h2 className="search-prompt"><FormattedMessage id="general.searchEmpty" /></h2>;
        } else if (this.state.loadMore) {
            searchAction = (
                <Button
                    onClick={this.handleGetSearchMore}
                >
                    <FormattedMessage id="general.loadMore" />
                </Button>
            );
        }
        return (
            <div
                className={this.state.isTutorial ? 'sillyTutorial' : ''}
                id="projectBox"
                key="projectBox"
            >
                {results}
                {searchAction}
            </div>
        );
    }
    render () {
        return (
            <div>
                <div className="outer">
                    <TitleBanner className="masthead">
                        <div className="inner">
                            <h1 className="title-banner-h1">
                                <FormattedMessage id="general.search" />
                            </h1>
                        </div>
                    </TitleBanner>
                    <Tabs>
                        {this.getTab('projects')}
                        {this.getTab('studios')}
                    </Tabs>
                    <div className="sort-controls">
                        <Form className="sort-mode">
                            <Select
                                name="sort"
                                options={[
                                    {
                                        value: 'trending',
                                        label: this.props.intl.formatMessage({id: 'search.trending'})
                                    },
                                    {
                                        value: 'popular',
                                        label: this.props.intl.formatMessage({id: 'search.popular'})
                                    }
                                ]}
                                value={this.state.mode}
                                onChange={this.handleChangeSortMode}
                            />
                        </Form>
                    </div>
                    {this.getProjectBox()}
                </div>
            </div>
        );
    }
}

Search.propTypes = {
    dispatch: PropTypes.func,
    intl: intlShape,
    searchTerm: PropTypes.string
};

const mapStateToProps = state => ({
    searchTerm: state.navigation.searchTerm
});

const WrappedSearch = injectIntl(Search);
const ConnectedSearch = connect(mapStateToProps)(WrappedSearch);

render(
    <Page><ConnectedSearch /></Page>,
    document.getElementById('app'),
    {navigation: navigationActions.navigationReducer}
);
