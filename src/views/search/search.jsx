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

const piano = require('../../lib/piano');

require('./search.scss');

class Search extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getSearchState',
            'handleChangeSortMode',
            'handleGetSearchMore',
            'handlePianoHover',
            'getTab',
            'tick'
        ]);
        this.state = this.getSearchState();
        this.state.loaded = [];
        this.state.loadNumber = 16;
        this.state.mode = 'popular';
        this.state.offset = 0;
        this.state.loadMore = false;

        this.state.isEgg = false;
        this.state.isPiano = false;
        this.state.isTutorial = false;
        this.state.isSpin = false;
        this.state.isColor = false;
        this.state.isGhost = false;
        this.state.isBrightness = false;
        this.state.isPixelate = false;
        this.state.isFisheye = false;
        this.state.elapsed = 0;

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

        if (term.includes('egg')) {
            this.makeSurprise('isEgg');
        }
        if (term.includes('piano') || term === 'music') {
            this.makeSurprise('isPiano');
        }
        if (term.includes('cat fact') || term.includes('tutorial')) {
            this.makeSurprise('isTutorial');
        }
        if (term.includes('spin') || term.includes('rotate') || term.includes('whirl')) {
            this.makeSurprise('isSpin');
            setInterval(this.tick, 200);
        }
        if (term.includes('color') || term.includes('rainbow')) {
            this.makeSurprise('isColor');
            setInterval(this.tick, 200);
        }
        if (term.includes('ghost')) {
            this.makeSurprise('isGhost');
            setInterval(this.tick, 200);
        }
        if (term.includes('brightness')) {
            this.makeSurprise('isBrightness');
            setInterval(this.tick, 200);
        }
        if (term.includes('pixelate')) {
            this.makeSurprise('isPixelate');
            setInterval(this.tick, 200);
        }
        if (term.includes('fisheye')) {
            this.makeSurprise('isFisheye');
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
    
    handlePianoHover (noteNumber) {
        piano(noteNumber, ACCEPTABLE_MODES.indexOf(this.state.mode));
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
    tick () {
        this.setState(prevState => (
            {elapsed: (prevState.elapsed + 10)}
        ));
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
                className={this.state.isTutorial ? 'sillyTutorial' : this.state.isFisheye ? 'fisheye' : ''}
                id="projectBox"
                key="projectBox"
            >
                {results}
                {searchAction}
            </div>
        );
    }
    fancyStyle () {
        const style = {};
        if (this.state.isSpin) {
            style.transform = `rotate(${this.state.elapsed}deg)`;
        }
        if (this.state.isColor) {
            style.filter = `hue-rotate(${this.state.elapsed}deg) saturate(400%)`;
        }
        if (this.state.isGhost) {
            style.opacity= `${Math.min(1, this.state.elapsed / 100)}`;
        }
        if (this.state.isBrightness) {
            style.filter = `brightness(${Math.max(1, 2 - (this.state.elapsed / 100))})`;
        }
        if (this.state.isPixelate && this.state.elapsed < 100) {
            const radius = Math.max(2, 10 - ((this.state.elapsed) / 10));
            const floodSize = radius > 1 ? Math.floor(radius - 1) : 1;
            const pixelateEffect = `
                <feFlood x="${floodSize}" y="${floodSize}" height="${(floodSize) / 2}" width="${(floodSize) / 2}" />
                <feComposite width="${radius * 2}" height="${radius * 2}" />
                <feTile result="a" />
                <feComposite in="SourceGraphic" in2="a" operator="in" />
                <feMorphology operator="dilate" radius="${radius}" />
            `;

            if (!this.pixelfilter) {
                this.pixelfilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                this.pixelfilter.setAttribute('x', 0);
                this.pixelfilter.setAttribute('y', 0);
                document.body.appendChild(this.pixelfilter);
            }
            this.pixelfilter.innerHTML = pixelateEffect;
            this.pixelfilter.setAttribute('id', `pixelate`);

            style.filter = `url(#pixelate)`;
        }

        return style;
    }

    render () {
        return (
            <div style={this.fancyStyle()} >
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
