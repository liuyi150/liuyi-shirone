/**
 * 个人设备展示页数据源
 * 行为与分类规则由 config/devices.yaml 控制
 */

export type DeviceStatus = "active" | "backup" | "archived" | "wishlist";

export interface DeviceSpecItem {
	key: string;
	label: string;
	value: string;
}

export interface DeviceItem {
	enable?: boolean;
	id: string;
	name: string;
	brand: string;
	category: string;
	status: DeviceStatus;
	specs: string;
	specDetails?: DeviceSpecItem[];
	description: string;
	image?: string;
	icon?: string;
	link?: string;
	featured?: boolean;
	year?: string;
}

export const devicesData: DeviceItem[] = [
	// 待填写：换成你自己的真实数据
];
