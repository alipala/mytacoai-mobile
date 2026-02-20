/**
 * Emoji Assets for A1/A2 Language Learning
 * OpenMoji SVG files - https://openmoji.org
 *
 * Usage in components:
 * import { EMOJIS } from '../assets/emojis';
 * const CoffeeSvg = EMOJIS.coffee;
 * <CoffeeSvg width={24} height={24} />
 */

// Food & Drink (10)
import CoffeeSvg from './coffee.svg';
import BreadSvg from './bread.svg';
import RiceSvg from './rice.svg';
import AppleSvg from './apple.svg';
import MilkSvg from './milk.svg';
import WaterSvg from './water.svg';
import PizzaSvg from './pizza.svg';
import HamburgerSvg from './hamburger.svg';
import PastaSvg from './pasta.svg';
import SaladSvg from './salad.svg';

// Emotions (8)
import HappySvg from './happy.svg';
import SmilingSvg from './smiling.svg';
import SadSvg from './sad.svg';
import AngrySvg from './angry.svg';
import TiredSvg from './tired.svg';
import SickSvg from './sick.svg';
import ConfusedSvg from './confused.svg';
import LoveSvg from './love.svg';

// Places (7)
import HomeSvg from './home.svg';
import OfficeSvg from './office.svg';
import SchoolSvg from './school.svg';
import StoreSvg from './store.svg';
import RestaurantSvg from './restaurant.svg';
import SubwaySvg from './subway.svg';
import ChurchSvg from './church.svg';

// Objects (10)
import PhoneSvg from './phone.svg';
import BookSvg from './book.svg';
import CarSvg from './car.svg';
import MoneySvg from './money.svg';
import WatchSvg from './watch.svg';
import ClothesSvg from './clothes.svg';
import BedSvg from './bed.svg';
import ChairSvg from './chair.svg';
import TvSvg from './tv.svg';
import DoorSvg from './door.svg';

// People & Family (5)
import ManSvg from './man.svg';
import WomanSvg from './woman.svg';
import BabySvg from './baby.svg';
import FamilySvg from './family.svg';
import FriendsSvg from './friends.svg';

// Actions (5)
import RunningSvg from './running.svg';
import SleepingSvg from './sleeping.svg';
import EatingSvg from './eating.svg';
import WalkingSvg from './walking.svg';
import WorkingSvg from './working.svg';

// Weather (6)
import SunnySvg from './sunny.svg';
import CloudySvg from './cloudy.svg';
import RainySvg from './rainy.svg';
import SnowSvg from './snow.svg';
import TemperatureSvg from './temperature.svg';
import WeatherSvg from './weather.svg';

// Transportation (6)
import BusSvg from './bus.svg';
import TrainSvg from './train.svg';
import AirplaneSvg from './airplane.svg';
import BicycleSvg from './bicycle.svg';
import TaxiSvg from './taxi.svg';
import ScooterSvg from './scooter.svg';

// Work & Education (6)
import BusinessmanSvg from './businessman.svg';
import TeacherSvg from './teacher.svg';
import DoctorSvg from './doctor.svg';
import WritingSvg from './writing.svg';
import ComputerSvg from './computer.svg';
import BooksSvg from './books.svg';

// Time (4)
import CalendarSvg from './calendar.svg';
import AlarmSvg from './alarm.svg';
import MorningSvg from './morning.svg';
import NightSvg from './night.svg';

// Sports (5)
import SoccerSvg from './soccer.svg';
import BasketballSvg from './basketball.svg';
import MusicSvg from './music.svg';
import GamingSvg from './gaming.svg';
import CameraSvg from './camera.svg';

// Complete emoji map for easy access
export const EMOJIS = {
  // Food
  coffee: CoffeeSvg,
  bread: BreadSvg,
  rice: RiceSvg,
  apple: AppleSvg,
  milk: MilkSvg,
  water: WaterSvg,
  pizza: PizzaSvg,
  hamburger: HamburgerSvg,
  pasta: PastaSvg,
  salad: SaladSvg,
  // Emotions
  happy: HappySvg,
  smiling: SmilingSvg,
  sad: SadSvg,
  angry: AngrySvg,
  tired: TiredSvg,
  sick: SickSvg,
  confused: ConfusedSvg,
  love: LoveSvg,
  // Places
  home: HomeSvg,
  office: OfficeSvg,
  school: SchoolSvg,
  store: StoreSvg,
  restaurant: RestaurantSvg,
  subway: SubwaySvg,
  church: ChurchSvg,
  // Objects
  phone: PhoneSvg,
  book: BookSvg,
  car: CarSvg,
  money: MoneySvg,
  watch: WatchSvg,
  clothes: ClothesSvg,
  bed: BedSvg,
  chair: ChairSvg,
  tv: TvSvg,
  door: DoorSvg,
  // People
  man: ManSvg,
  woman: WomanSvg,
  baby: BabySvg,
  family: FamilySvg,
  friends: FriendsSvg,
  // Actions
  running: RunningSvg,
  sleeping: SleepingSvg,
  eating: EatingSvg,
  walking: WalkingSvg,
  working: WorkingSvg,
  // Weather
  sunny: SunnySvg,
  cloudy: CloudySvg,
  rainy: RainySvg,
  snow: SnowSvg,
  temperature: TemperatureSvg,
  weather: WeatherSvg,
  // Transportation
  bus: BusSvg,
  train: TrainSvg,
  airplane: AirplaneSvg,
  bicycle: BicycleSvg,
  taxi: TaxiSvg,
  scooter: ScooterSvg,
  // Work
  businessman: BusinessmanSvg,
  teacher: TeacherSvg,
  doctor: DoctorSvg,
  writing: WritingSvg,
  computer: ComputerSvg,
  books: BooksSvg,
  // Time
  calendar: CalendarSvg,
  alarm: AlarmSvg,
  morning: MorningSvg,
  night: NightSvg,
  // Sports
  soccer: SoccerSvg,
  basketball: BasketballSvg,
  music: MusicSvg,
  gaming: GamingSvg,
  camera: CameraSvg,
};

// Emoji name type for TypeScript autocomplete
export type EmojiName = keyof typeof EMOJIS;

// Helper to get emoji by name (safe with fallback)
export const getEmoji = (name: string): any => {
  return EMOJIS[name as EmojiName] || null;
};
