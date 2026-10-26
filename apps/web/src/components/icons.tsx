// One icon family for the whole site: Phosphor (MIT), drawn on a 256 grid with rounded joins, close to SF Symbols in feel.
// Components keep using simple names; weight follows the props: filled for selected states, bold for small emphasis.
import type { CSSProperties } from "react";
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";
import { Archive as PArchive, ArrowBendUpLeft as PArrowBendUpLeft, ArrowRight as PArrowRight, ArrowSquareOut as PArrowSquareOut, ArrowUp as PArrowUp, ArrowUpRight as PArrowUpRight, ArrowsClockwise as PArrowsClockwise, Bell as PBell, BookmarkSimple as PBookmarkSimple, Briefcase as PBriefcase, Buildings as PBuildings, CalendarBlank as PCalendarBlank, CaretLeft as PCaretLeft, CaretRight as PCaretRight, ChatCircle as PChatCircle, ChatTeardropText as PChatTeardropText, Check as PCheck, CircleHalf as PCircleHalf, Clock as PClock, Code as PCode, Copy as PCopy, Cpu as PCpu, Cube as PCube, CursorClick as PCursorClick, Devices as PDevices, DotsThree as PDotsThree, DownloadSimple as PDownloadSimple, Export as PExport, Eye as PEye, EyeSlash as PEyeSlash, Flag as PFlag, Gauge as PGauge, Gear as PGear, Globe as PGlobe, GridFour as PGridFour, Heart as PHeart, Heartbeat as PHeartbeat, ImageSquare as PImageSquare, Info as PInfo, Lightning as PLightning, Link as PLink, LinkSimple as PLinkSimple, List as PList, LockSimple as PLockSimple, MagnifyingGlass as PMagnifyingGlass, MapPin as PMapPin, Minus as PMinus, Moon as PMoon, Palette as PPalette, PencilSimple as PPencilSimple, Play as PPlay, Plus as PPlus, PushPin as PPushPin, RocketLaunch as PRocketLaunch, ShieldCheck as PShieldCheck, SignOut as PSignOut, Sparkle as PSparkle, SquaresFour as PSquaresFour, Stack as PStack, Star as PStar, Sun as PSun, TerminalWindow as PTerminalWindow, Trash as PTrash, Tray as PTray, Usb as PUsb, UserCircle as PUserCircle, UserPlus as PUserPlus, UsersThree as PUsersThree, Wallet as PWallet, WarningCircle as PWarningCircle, X as PX } from "@phosphor-icons/react/dist/ssr";

export type IconProps = { size?: number; strokeWidth?: number; fill?: string; weight?: IconWeight; className?: string; style?: CSSProperties; "aria-label"?: string };

function make(I: PhosphorIcon) {
  function Icon({ size = 20, strokeWidth, fill, weight, className, style, ...rest }: IconProps) {
    const w: IconWeight = weight ?? (fill && fill !== "none" ? "fill" : strokeWidth && strokeWidth >= 2.2 ? "bold" : "regular");
    return <I size={size} weight={w} className={className} style={style} aria-hidden={rest["aria-label"] ? undefined : true} {...rest} />;
  }
  return Icon;
}

export const Check = make(PCheck);
export const Trash2 = make(PTrash);
export const X = make(PX);
export const Search = make(PMagnifyingGlass);
export const MessageCircle = make(PChatCircle);
export const LayoutGrid = make(PSquaresFour);
export const Heart = make(PHeart);
export const Briefcase = make(PBriefcase);
export const Bookmark = make(PBookmarkSimple);
export const Wallet = make(PWallet);
export const Sparkles = make(PSparkle);
export const Repeat2 = make(PArrowsClockwise);
export const LogOut = make(PSignOut);
export const Link2 = make(PLinkSimple);
export const ExternalLink = make(PArrowSquareOut);
export const Download = make(PDownloadSimple);
export const Cpu = make(PCpu);
export const Copy = make(PCopy);
export const Clock = make(PClock);
export const ChevronLeft = make(PCaretLeft);
export const ChevronRight = make(PCaretRight);
export const Bell = make(PBell);
export const Users = make(PUsersThree);
export const UserPlus = make(PUserPlus);
export const User = make(PUserCircle);
export const Usb = make(PUsb);
export const SunMoon = make(PCircleHalf);
export const Sun = make(PSun);
export const Moon = make(PMoon);
export const Settings = make(PGear);
export const Reply = make(PArrowBendUpLeft);
export const Plus = make(PPlus);
export const Play = make(PPlay);
export const Pin = make(PPushPin);
export const PencilLine = make(PPencilSimple);
export const MoreHorizontal = make(PDotsThree);
export const MonitorSmartphone = make(PDevices);
export const Menu = make(PList);
export const MapPin = make(PMapPin);
export const Layers = make(PStack);
export const Inbox = make(PTray);
export const ImagePlus = make(PImageSquare);
export const HeartPulse = make(PHeartbeat);
export const Globe = make(PGlobe);
export const Flag = make(PFlag);
export const EyeOff = make(PEyeSlash);
export const Eye = make(PEye);
export const Code2 = make(PCode);
export const Code = make(PCode);
export const Building2 = make(PBuildings);
export const ArrowUpRight = make(PArrowUpRight);
export const ArrowUp = make(PArrowUp);
export const ArrowRight = make(PArrowRight);
export const Archive = make(PArchive);
export const Lightning = make(PLightning);
export const Cube = make(PCube);
export const Terminal = make(PTerminalWindow);
export const Share = make(PExport);
export const Star = make(PStar);
export const Lock = make(PLockSimple);
export const Shield = make(PShieldCheck);
export const Gauge = make(PGauge);
export const Palette = make(PPalette);
export const Cursor = make(PCursorClick);
export const Chat = make(PChatTeardropText);
export const Calendar = make(PCalendarBlank);
export const Info = make(PInfo);
export const Warning = make(PWarningCircle);
export const Link = make(PLink);
export const Trash = make(PTrash);
export const Minus = make(PMinus);
export const Grid = make(PGridFour);
export const Rocket = make(PRocketLaunch);
