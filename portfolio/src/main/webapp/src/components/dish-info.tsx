import * as Surplus from 'surplus';

interface CookingSectionProps {
  info: {
    attributes: { name: string; image: string };
    body: HTMLElement[];
  };
}

export const CookingSection = ({info}: CookingSectionProps) => {
  return (
    <section class='cooking-section'>
      <img
        src={require(`@res/img/dish/${info.attributes.image}`).default}
        alt={info.attributes.name}
      />
      <div>
        <h3>{info.attributes.name}</h3>
        {info.body}
      </div>
    </section>
  );
};
