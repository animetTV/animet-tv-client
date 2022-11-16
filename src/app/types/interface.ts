export interface WebsiteURL {
    NSFW: boolean;
    DOMAIN: string;
    SEARCH: string;
    EP?: string;
}
export const externalWebsites: WebsiteURL[] = [
    { NSFW: true, DOMAIN: 'hentaimama.io', SEARCH: '/?s=', EP: '/tvshows/' },
]

export interface TopSeason {
    genre?: string;
    mal_id: number;
    img_url: string;
    members?: number;
    score?: string;
    synopsis?: string;
    title: string;
}

export interface Season {
    value: string;
    viewValue: string;
}

export interface SeasonsDetail {
    id: number;
    season_name: string;
    season_year: number;
}

export interface GetNewSeason {
    id: string,
    year: number;
    season: string;
}

export interface SeasonSelect {
    season_name: string;
    color?: string;
    season: string;
    path: string;
}

export interface SearchResult {
    mal_id?: number;
    title: string;
    img_url: string;
    id?: string;
    episodeNumber?: number;
    episodes?: number;
    airing_start?: number;
}

export interface User {
    accountID: string;
    token: string;
}

export interface Rating {
    postID: string;
    rating: string;
    accountID?: string;
    isUser?: boolean;
    nsfw?: boolean;
}

/* User Profile & List */
export interface Profile {
    accountID: string;
    avatarName: string;
    email: string;
    isProfilePublic: boolean;
    avatarFileID: string;
    avatarFileName: string;
}

export interface ContinueWatchData {
    episodeNumber: number;
    totalEpisode: number;
    type: boolean;
}

export interface List {
    dateCreated: Date;
    _id: string;
    item_id?: string;
    mal_id?: number;
    img_url: string;
    title: string;
    nsfw?: boolean;
    continue_watch_data?: ContinueWatchData
}

export interface UserLists {
    plan_to_watch: List[];
    completed: List[];
}

export interface PublicUser {
    list: UserLists,
    profile: Profile
}

export interface ItemRequest {
    item_id: string;
    img_url: string;
    title: string;
    nsfw: boolean;
    LIST: string;
}


/* Watch Anime */
export interface WatchAnimeResult {
    title: string;
    img: string;
    synopsis: string;
    genres?: (string)[] | null;
    relased: string;
    status: string;
    OtherName?: string;
    totalEpisodes: number;
    episodes: (EpisodesEntity)[] | null;
    totalepisode: number,
    type?: string,
    id_sub?: string;
    id_dub?: string;
    
}
export interface EpisodesEntity {
    id: string;
    title: string;
    isFiller: boolean;
}

/* export interface EpisodeStream {
    img: string;
    synopsis: string;
    genres?: (string)[] | null;
    category: string;
    released: number;
    status: string;
    otherName: string;
    totalEpisodes: number;
    servers?: (ServersEntity)[] | null;
}
export interface ServersEntity {
    name: string;
    iframe: string;
}
*/

export interface Link {
    src: string;
    size: string;
    iframe: boolean;
}

export interface EpisodeStream {
    links: Link[];
}

/* Continue Watching */
export interface ContinueWatching_ItemAdd {
    animeTitle: string;
    img_url: string;
    episodeNumber: number;
    totalEpisode: number;
    type: boolean;
}

// Must watch
export interface MustWatch {
    type: string;
    animes?: (AnimesEntity)[] | null;
  }
  export interface AnimesEntity {
    title: string;
    img_url: string;
  }


// last open

export interface LastOpen { 
    animeTitle: string;
    episodeNumber: number;
    date: Date,
    img_url: string;  
    type: boolean; 
}


export interface Genres  {
    Action: SearchResult[];
    Adventure: SearchResult[];
    Cars: SearchResult[];
    Comedy: SearchResult[];
    Dementia: SearchResult[];
    Demons: SearchResult[];
    Drama: SearchResult[];
    Dub: SearchResult[];
    Ecchi: SearchResult[];
    Fantasy: SearchResult[];
    Game: SearchResult[];
    Harem: SearchResult[];
    Historical: SearchResult[];
    Horror: SearchResult[];
    Josei: SearchResult[];
    Kids: SearchResult[];
    Magic: SearchResult[];
    Martial_Arts: SearchResult[];
    Mecha: SearchResult[];
    Military: SearchResult[];
    Music: SearchResult[];
    Mystery: SearchResult[];
    Parody: SearchResult[];
    Police: SearchResult[];
    Psychological: SearchResult[];
    Romance: SearchResult[];
    Samurai: SearchResult[];
    School: SearchResult[];
    Sci_Fi: SearchResult[];
    Seinen: SearchResult[];
    Shoujo: SearchResult[];
    Shoujo_Ai: SearchResult[];
    Shounen: SearchResult[];
    Shounen_Ai: SearchResult[];
    Slice_of_Life: SearchResult[];
    Space: SearchResult[];
    Sports: SearchResult[];
    Super_Power: SearchResult[];
    Supernatural: SearchResult[];
    Thriller: SearchResult[];
    Vampire: SearchResult[];
    Yaoi: SearchResult[];
    Yuri: SearchResult[];
}
  
export interface RecentlyAddedEntity {
    title: string;
    id: string;
    img_url: string;
    episodeNumber?: number;
    episodes:number;
    type: string;
    score: number;
}

export interface RecentlyAdded {
    SUB: [RecentlyAddedEntity],
    DUB: [RecentlyAddedEntity]
}

export interface Spotlight {
    title: string;
    img: string;
    synopsis: string;
    isAIContent?: boolean;
}

export interface VideoGallerySource {
    src: string;
    provider: string;
    title?: string;
}


export interface JWplayerSourceItem {
    default: boolean;
    type: string;
    file: string;
    label: string;
}


export interface UserSocial {
    instagram?: string;
    twitter?: string;
    mal?: string;
    anilist?: string;
}

export interface UserStat {
    email: string;
    accountID: string;
    watching: number;
    plan_to_watch: number;
    completed: number;
    socials?: UserSocial;
    avatarFileID: string;
    avatarFileName?: string;
    channelViews?: string;
}

export interface Tops {
    TRENDING: [TopSeason],
    ALL_TIME_POPULAR: [TopSeason],
    UPCOMING: [TopSeason],
    TOP_OF_THE_WEEK: [TopSeason],
}

export interface CorsAnyWhereItem {
    label?: string;
    continent?: string;
    url?: string;
}

export interface jwplayerMP4SourceItem {
    file: string;
    label: string;
}

export interface AllTitles {
    gogoanime: PreparedTitle[];
    crunchyroll: PreparedTitle[];
}

export interface PreparedTitle {
    title: string;
    id: string;
}

export interface Download {
    lable: string;
    url: string;
    ads: boolean
}

export interface CommentCount {
    comment: string;
}

export interface QuickBitsSource  {
    videoID: string;
    videoTitle: string;
    src: string;
    src_type: string;
    uploaderUsername: string;
    uploaderAvatar: string;
    likes: number;
    dislikes: number;
    dateUploaded: string;
    hashTags: string[];
  }