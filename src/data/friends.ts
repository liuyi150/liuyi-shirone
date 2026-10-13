/**
 * 友情链接数据源
 * 用于 /friends/ 页面展示
 */

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "思睿SiruiのBlog",
		imgurl: "https://siruis.top/avatar.webp",
		desc: "这是什么，点一下...",
		siteurl: "https://siruis.top",
		tags: ["Blog"],
	},
];

export function getFriendsList(): FriendItem[] {
	return friendsData;
}

export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
