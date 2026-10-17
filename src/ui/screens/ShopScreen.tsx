import { useState } from 'react'
import { motion } from 'framer-motion'
import { tuning } from '@/config/tuning'
import { characters, outfits } from '@/content/characters'
import { powerUpInfo, TIMED_POWER_UPS } from '@/content/powerUps'
import { equipCharacter, equipOutfit, itemCost, powerUpDuration, purchase } from '@/game/progression/shop'
import { showToast } from '@/store/gameStore'
import { commitProfile, getProfile, useProfileStore } from '@/store/profileStore'
import { GoldAmount } from '@/ui/components/GoldAmount'
import { ScreenHeader } from '@/ui/components/ScreenHeader'
import { fade } from '@/ui/transitions/fade'
import styles from './Screen.module.css'

type Tab = 'powerUps' | 'items' | 'characters'

const tabs: { id: Tab; label: string }[] = [
  { id: 'powerUps', label: 'Power-ups' },
  { id: 'items', label: 'Items' },
  { id: 'characters', label: 'Characters' },
]

const buy = (itemId: string) => {
  const result = purchase(getProfile(), itemId)
  if (result.ok) commitProfile(result.profile)
  else if (result.reason === 'insufficient-gold') showToast('Not enough gold yet')
}

function BuyButton({ itemId, label }: { itemId: string; label?: string }) {
  const profile = useProfileStore((state) => state.profile)
  const cost = itemCost(profile, itemId)
  if (cost === null) {
    return (
      <button type="button" className={styles.buy} disabled>
        Max
      </button>
    )
  }
  return (
    <button type="button" className={styles.buy} disabled={profile.gold < cost} onClick={() => buy(itemId)}>
      {label ?? 'Buy'}
      <GoldAmount value={cost} size="sm" />
    </button>
  )
}

function PowerUpsTab() {
  const upgrades = useProfileStore((state) => state.profile.upgrades)
  return (
    <>
      {TIMED_POWER_UPS.map((id) => {
        const level = upgrades[id]
        return (
          <div key={id} className={styles.card}>
            <div>
              <h3 className={styles.cardTitle}>
                <span className={styles.swatch} style={{ background: powerUpInfo[id].color }} />
                {powerUpInfo[id].name}
              </h3>
              <p className={styles.cardText}>
                {powerUpInfo[id].effect}. Lasts {powerUpDuration(id, level)} s
              </p>
              <div className={styles.pips} aria-label={`Level ${level} of ${tuning.powerUps.maxLevel}`}>
                {Array.from({ length: tuning.powerUps.maxLevel }, (_, i) => (
                  <span key={i} className={styles.pip} data-on={i < level} />
                ))}
              </div>
            </div>
            <BuyButton itemId={`upgrade:${id}`} label="Upgrade" />
          </div>
        )
      })}
    </>
  )
}

function ItemsTab() {
  const sankofa = useProfileStore((state) => state.profile.sankofaTokens)
  const charms = useProfileStore((state) => state.profile.shieldCharms)
  return (
    <>
      <div className={styles.card}>
        <div>
          <h3 className={styles.cardTitle}>Sankofa token</h3>
          <p className={styles.cardText}>
            After a crash, rewind 2 seconds and keep running. You have {sankofa}.
          </p>
        </div>
        <BuyButton itemId="sankofa" />
      </div>
      <div className={styles.card}>
        <div>
          <h3 className={styles.cardTitle}>Shield charm</h3>
          <p className={styles.cardText}>
            Double-tap (or press E) during a run for a Gye Nyame Shield. You have {charms}.
          </p>
        </div>
        <BuyButton itemId="charm" />
      </div>
    </>
  )
}

function CharactersTab() {
  const profile = useProfileStore((state) => state.profile)
  const equip = (next: typeof profile) => commitProfile(next)
  return (
    <>
      <p className={styles.notice}>Placeholder colours until the 3D characters arrive.</p>
      <h3 className={styles.sectionTitle}>Characters</h3>
      {characters.map((character) => {
        const owned = profile.unlockedCharacters.includes(character.id)
        const equipped = profile.equipped.character === character.id
        return (
          <div key={character.id} className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.swatch} style={{ background: character.color }} />
              {character.name}
            </h3>
            {owned ? (
              <button
                type="button"
                className={styles.buy}
                data-variant="equip"
                disabled={equipped}
                onClick={() => equip(equipCharacter(getProfile(), character.id))}
              >
                {equipped ? 'Equipped' : 'Equip'}
              </button>
            ) : (
              <BuyButton itemId={`character:${character.id}`} label="Unlock" />
            )}
          </div>
        )
      })}
      <h3 className={styles.sectionTitle}>Outfits</h3>
      {outfits.map((outfit) => {
        const owned = profile.unlockedOutfits.includes(outfit.id)
        const equipped = profile.equipped.outfit === outfit.id
        return (
          <div key={outfit.id} className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.swatch} style={{ background: outfit.accent }} />
              {outfit.name}
            </h3>
            {owned ? (
              <button
                type="button"
                className={styles.buy}
                data-variant="equip"
                onClick={() => equip(equipOutfit(getProfile(), equipped ? null : outfit.id))}
              >
                {equipped ? 'Take off' : 'Wear'}
              </button>
            ) : (
              <BuyButton itemId={`outfit:${outfit.id}`} label="Unlock" />
            )}
          </div>
        )
      })}
    </>
  )
}

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('powerUps')
  return (
    <motion.section className={styles.screen} {...fade}>
      <ScreenHeader title="Shop" onBack={onBack} />
      <div className={styles.tabs} role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={styles.tab}
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.body}>
        {tab === 'powerUps' && <PowerUpsTab />}
        {tab === 'items' && <ItemsTab />}
        {tab === 'characters' && <CharactersTab />}
      </div>
    </motion.section>
  )
}
