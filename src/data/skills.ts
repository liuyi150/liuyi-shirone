/**
 * 技能图谱数据源
 * 用于 /skills/ 页面展示
 */

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface SkillItem {
	enable?: boolean;
	name: string;
	description?: string;
	icon?: string;
	category: string;
	level: SkillLevel;
}

export const skillsData: SkillItem[] = [
	// 待填写：换成你自己的真实数据
];
