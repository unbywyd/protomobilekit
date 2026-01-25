# ProtoMobileKit - Architecture Consultation

## Что это за проект

ProtoMobileKit - библиотека для быстрого прототипирования мобильных приложений на React. Позволяет:
- Создавать UI компоненты в стиле iOS/Android
- Навигация (табы, стеки)
- Канвас с несколькими приложениями одновременно (Customer, Courier, Admin)
- DevTools для переключения между экранами/пользователями

## Текущая архитектура

### Режимы работы

1. **Multi-app Canvas** (`App.tsx`) - несколько приложений на одном экране в device frames
2. **Single-app mode** (`SingleApp.tsx`) - одно приложение на весь экран с hash-навигацией

### Навигация

```tsx
<Navigator initial="home" type="tabs" useHash>
  <Navigator.Screen name="home" component={HomeScreen} icon={...} label="Home" />
  <Navigator.Screen name="restaurant" component={RestaurantScreen} />
  <Navigator.Screen name="orders" component={OrdersScreen} icon={...} label="Orders" />
</Navigator>
```

- `useHash` - синхронизация с URL hash (`#/restaurant?id=r1`)
- Экраны с `icon`/`label` показываются в tab bar
- Экраны без них - детальные страницы (push в стек)

### Фреймы (для DevTools)

```tsx
defineFrames({
  appId: 'customer',
  frames: [
    createFrame({ id: 'home', name: '1.1 Home', component: HomeScreen }),
    createFrame({ id: 'restaurant', name: '1.2 Restaurant', component: RestaurantScreen, params: { id: 'r1' } }),
  ]
})
```

Фреймы регистрируют экраны для DevTools панели, чтобы можно было быстро переключаться.

### Проблема с параметрами

Некоторые экраны требуют параметры для работы:

```tsx
function RestaurantScreen() {
  const { params } = useRoute<{ id: string }>()
  const { items } = useQuery<Restaurant>('Restaurant', {
    filter: (r) => r.id === params.id  // ← нужен id!
  })
  // Если params.id undefined → белый экран
}
```

## Проблема которую хочу решить

### Сценарии доступа к экрану

1. **Обычная навигация** - пользователь кликает на ресторан в списке:
   ```tsx
   navigate('restaurant', { id: 'r1' })  // ✅ params есть
   ```

2. **Прямой URL** - `http://localhost/prototype#/restaurant?id=r1`:
   ```tsx
   // ✅ params парсятся из hash
   ```

3. **Прямой URL без params** - `http://localhost/prototype#/restaurant`:
   ```tsx
   // ❌ params.id = undefined → белый экран
   ```

4. **DevTools клик на фрейм**:
   ```tsx
   // Сейчас передаём params из Frame.params
   // Но это костыль - данные дублируются
   ```

### Текущее решение (которое не нравится)

В `createFrame` указываем дефолтные params:
```tsx
createFrame({
  id: 'restaurant',
  component: RestaurantScreen,
  params: { id: 'r1' }  // ← дублирование данных
})
```

Проблемы:
- Данные о моках размазаны (в entities и в params)
- Нужно синхронизировать id с реальными данными в store
- Непонятно где source of truth

### Альтернативы которые рассматривал

**1. Fallback в компоненте**
```tsx
function RestaurantScreen() {
  const { params } = useRoute<{ id: string }>()
  const id = params.id || 'r1'  // fallback для превью
}
```
- ✅ Просто
- ❌ Захламляет бизнес-компоненты preview логикой
- ❌ Нужно знать какой id существует в store

**2. Preview-обёртки**
```tsx
function RestaurantPreview() {
  return <RestaurantScreen params={{ id: 'r1' }} />
}
```
- ✅ Чистые бизнес-компоненты
- ❌ Много бойлерплейта

**3. Хук usePreviewParams**
```tsx
function RestaurantScreen() {
  const { id } = usePreviewParams('restaurant', { id: 'r1' })
}
```
- ✅ Централизованно
- ❌ Компонент всё равно знает о preview режиме

**4. Автоматический первый элемент**
```tsx
function RestaurantScreen() {
  const { params } = useRoute<{ id: string }>()
  const { items } = useQuery<Restaurant>('Restaurant')
  const restaurant = params.id
    ? items.find(r => r.id === params.id)
    : items[0]  // ← первый если нет id
}
```
- ✅ Не нужно хардкодить id
- ❌ Непредсказуемо какой элемент покажется

## Вопросы для консультации

1. Как правильно архитектурно решить проблему "экрану нужны данные для отображения, но в preview/direct-link режиме их нет"?

2. Должен ли компонент экрана знать о том что он может быть в preview режиме, или это должно быть полностью прозрачно?

3. Где должен быть source of truth для mock/preview данных?

4. Есть ли паттерны в других библиотеках для прототипирования (Storybook, Figma plugins) для решения подобных проблем?

## Контекст использования

- Это инструмент для прототипирования, не production приложение
- Пользователи - дизайнеры и разработчики создающие макеты
- Важна скорость итераций и простота
- DevTools позволяет быстро переключаться между экранами для демонстрации
- URL sharing важен для показа конкретного экрана заказчику
