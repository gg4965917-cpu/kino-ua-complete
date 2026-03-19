-- Insert Ukrainian dubbing data
INSERT INTO public.dubbing (tmdb_id, title_uk, studio, quality, has_subtitles, voice_actors) VALUES
(530915, '1+1', 'Кіностудія 1+1 Media', '1080p', true, 'Олександр Плахута, Ігор Панін'),
(465136, 'Захист Сараєво', '1+1 Media', '720p', true, 'Вадим Модест Колодій'),
(610201, 'Атлантида', 'Квартал 95', '720p', true, 'Василь Вовк'),
(467531, 'Ціна правди', 'The Platform', '1080p', true, 'Дмитро Близнюк'),
(746969, 'Стоп-Земля', 'MONSTRUM', '720p', true, 'Дар\'я Кримова'),
(572154, 'Додому', 'Cinema 1', '720p', true, 'Антон Місєвич'),
(857041, 'Бліндаж', '1+1 Media', '720p', true, 'Дарія Кримова'),
(737173, 'Толока', 'MONSTRUM', '720p', true, 'Ольга Кострова'),
(192210, 'Поводир', 'Dovzhenko Film Studio', '720p', true, 'Володимир Геркулес'),
(619592, 'Чорний ворон', 'Star Media', '720p', true, 'Василь Вовк');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dubbing_studio ON public.dubbing(studio);
CREATE INDEX IF NOT EXISTS idx_dubbing_quality ON public.dubbing(quality);
