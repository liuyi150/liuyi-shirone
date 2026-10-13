/**
 * 侧栏音乐播放器本地曲目数据源
 * 用于 music.yaml 中的 local 与 mixed 模式
 */

export interface TrackDescriptor {
	id: string;
	title: string;
	artist?: string;
	cover?: string;
	source: string;
	duration?: number;
}

export const musicTracks: readonly TrackDescriptor[] = [
	{
		id: "zhi-geng-niao-shi-yi-ke-xin",
		title: "使一颗心免于哀伤",
		artist: "知更鸟 / HOYO-MiX / Chevy",
		cover: "assets/images/music/109951169585655912.webp",
		source: "/assets/music/使一颗心免于哀伤-哼唱.mp3",
	},
];
