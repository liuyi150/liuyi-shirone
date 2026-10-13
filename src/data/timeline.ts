/**
 * 大事记时间线数据源
 * 用于 /timeline/ 页面展示
 */

export interface TimelineLink {
	label: string;
	url: string;
	icon?: string;
}

export interface TimelineItem {
	enable?: boolean;
	title: string;
	date: string;
	category?: string;
	subtitle?: string;
	location?: string;
	description?: string;
	highlights?: string[];
	tags?: string[];
	links?: TimelineLink[];
	icon?: string;
	featured?: boolean;
}

export const timelineData: TimelineItem[] = [
	// 待填写：换成你自己的真实数据
];
