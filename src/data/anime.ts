/**
 * 番剧收藏本地数据源
 * 用于番剧展示页：/anime/
 */

export type AnimeStatus =
	| "watching"
	| "completed"
	| "planned"
	| "onHold"
	| "dropped";

export interface AnimeIdentity {
	provider: "local" | "bangumi" | "bilibili";
	sourceId?: string;
	seasonId?: string;
	subjectId?: string;
}

export interface AnimeItem {
	title: string;
	cover?: string;
	link?: string;
	status: AnimeStatus;
	rating: number;
	progress?: { watched: number; total: number };
	description?: string;
	year: string;
	studio?: string;
	genres: string[];
	period?: { start: string; end: string };
	identity?: AnimeIdentity;
}

export const animeData: AnimeItem[] = [
	// 待填写：换成你自己的真实数据
];
