/**
 * 站点罗盘导航数据源
 * 用于 /compass/ 页面展示
 */

export interface CompassEntry {
	label: string;
	href: string;
	note?: string;
	icon?: string;
	image?: string;
}

export interface CompassShelf {
	key: string;
	name: string;
	icon?: string;
	blurb?: string;
	entries: CompassEntry[];
}

export const compassData: CompassShelf[] = [
	// 待填写：换成你自己的真实数据
];
