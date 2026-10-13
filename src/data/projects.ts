/**
 * 开源项目数据源
 * 用于 /projects/ 页面展示
 */

export type ProjectPhase = "shipped" | "building" | "exploring";

export interface ProjectItem {
	enable?: boolean;
	key: string;
	title: string;
	summary: string;
	category: string;
	phase: ProjectPhase;
	technologies: string[];
	icon?: string;
	cover?: string;
	coverAlt?: string;
	featured?: boolean;
	website?: string;
	repository?: string;
	year?: string;
}

export const projectsData: ProjectItem[] = [
	// 待填写：换成你自己的真实数据
];

export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
